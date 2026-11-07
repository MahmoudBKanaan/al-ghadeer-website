import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBase, resolveSiteUrl } from '../scripts/settings.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(project, process.env.DIST_DIR || 'dist');
const fromDist = path => resolve(dist, path);
const read = path => readFileSync(fromDist(path), 'utf8');
const readJson = path => JSON.parse(read(path));
const menu = JSON.parse(readFileSync(resolve(project, 'src/menu-data.json'), 'utf8'));
const metadata = readJson('build-info.json');

function isFile(path) {
  return statSync(fromDist(path), { throwIfNoEntry: false })?.isFile() === true;
}

function pageFile(path) {
  const relative = path.replace(/^\//, '');
  return path.endsWith('/') ? `${relative}index.html` : relative;
}

function decodeHtml(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, entity => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
    if (entity[1] !== '#') return named[entity.toLowerCase()];
    const code = entity[2].toLowerCase() === 'x'
      ? Number.parseInt(entity.slice(3, -1), 16)
      : Number.parseInt(entity.slice(2, -1), 10);
    return String.fromCodePoint(code);
  });
}

function attributes(tag) {
  const entries = [...tag.matchAll(/\s([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=`<>]+))/g)];
  return Object.fromEntries(entries.map(([, key, double, single, plain]) => [
    key.toLowerCase(),
    decodeHtml(double ?? single ?? plain),
  ]));
}

function tagAttributes(html, tag) {
  const pattern = new RegExp(`<${tag}\\b(?:[^<>"']|"[^"]*"|'[^']*')*>`, 'gi');
  return [...html.matchAll(pattern)].map(([match]) => attributes(match));
}

function schemaTypes(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(schemaTypes);
  const type = value['@type'];
  return [...(Array.isArray(type) ? type : type ? [type] : []), ...Object.values(value).flatMap(schemaTypes)];
}

const { base, siteUrl } = metadata;
assert.match(base, /^\/(?:[\w.-]+\/)*$/, 'Invalid asset base in build-info.json');
if (process.env.BASE_PATH || process.env.SITE_URL) {
  assert.equal(base, resolveBase(), 'The requested BASE_PATH differs from the built base');
}
if (process.env.SITE_URL) {
  assert.equal(siteUrl, resolveSiteUrl()?.href, 'The requested SITE_URL differs from the built site URL');
}
if (siteUrl) {
  assert.equal(new URL(siteUrl).protocol, 'https:', 'Production URL must use HTTPS');
  assert.equal(new URL(siteUrl).pathname, base, 'Production URL path must match the built base');
}

assert(Array.isArray(menu.categories) && menu.categories.length > 0, 'Menu must contain categories');
const items = menu.categories.flatMap(category => {
  assert.match(category.id, /^[a-z\d]+(?:-[a-z\d]+)*$/, 'Invalid category slug');
  assert(category.name?.trim(), `${category.id} is missing its display name`);
  assert(Array.isArray(category.items) && category.items.length > 0, `${category.id} is empty`);
  return category.items;
});
const itemById = new Map(items.map(item => [item.id, item]));
assert.equal(items.length, itemById.size, 'Menu item slugs must be unique');
for (const { id, name, prices } of items) {
  assert.match(id, /^[a-z\d]+(?:-[a-z\d]+)*$/, 'Invalid item slug');
  assert(name?.trim(), `${id} is missing its display name`);
  assert(Array.isArray(prices) && prices.every((price, index) =>
    Number.isFinite(price) && price > 0 && (index === 0 || price >= prices[index - 1])
  ), `${id} has invalid or unsorted prices`);
}

const routes = ['/', '/story/', '/menu/', '/locations/', '/contact/',
  ...items.map(({ id }) => `/menu/${id}/`), '/404.html'];
assert.deepEqual([...metadata.routes].sort(), [...routes].sort(), 'Build manifest routes do not match the full catalog');

const internalOrigin = 'https://verify.invalid';
const robots = read('robots.txt');
assert.match(robots, /^User-agent:\s*\*\s*$/im, 'robots.txt must cover every crawler');
assert.match(robots, /^Allow:\s*\/\s*$/im, 'robots.txt must allow crawlers to read page directives');
const sitemapDirective = robots.match(/^Sitemap:\s*(\S+)\s*$/im)?.[1];

if (siteUrl) {
  const sitemapUrl = new URL('sitemap.xml', siteUrl).href;
  assert.equal(sitemapDirective, sitemapUrl, 'robots.txt must point to the absolute production sitemap');
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<urlset\b/, 'Sitemap is missing its URL set');
  const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decodeHtml(url));
  const expected = routes.filter(route => route !== '/404.html').map(route => new URL(route.slice(1), siteUrl).href);
  assert.deepEqual(entries.sort(), expected.sort(), 'Sitemap must cover every public page once and exclude 404');
} else {
  assert(!sitemapDirective && !isFile('sitemap.xml'), 'Staging build must not expose a sitemap');
}

function localPath(value, current, route) {
  if (!value || value.startsWith('#')) return null;
  const parsed = new URL(value, current);
  if (parsed.origin !== internalOrigin) return null;
  const path = decodeURIComponent(parsed.pathname);
  assert(path.startsWith(base), `${route}: local URL is outside the configured base: ${value}`);
  const relative = path.slice(base.length);
  const destination = fromDist(pageFile(`/${relative}`));
  assert(destination.startsWith(`${dist}${sep}`), `${route}: local URL resolves outside dist: ${value}`);
  return relative;
}

const seenTitles = new Set();
let internalReferences = 0;
for (const route of routes) {
  const html = read(pageFile(route));
  const [root] = tagAttributes(html, 'html');
  assert.equal(root?.lang, 'ar', `${route}: missing Arabic language declaration`);
  assert.equal(root?.dir, 'rtl', `${route}: missing right-to-left direction`);

  const title = decodeHtml(html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || '');
  assert(/\p{Script=Arabic}/u.test(title), `${route}: missing Arabic title`);
  assert(!seenTitles.has(title), `${route}: duplicate page title "${title}"`);
  seenTitles.add(title);

  const meta = tagAttributes(html, 'meta');
  const description = meta.find(entry => entry.name === 'description')?.content;
  assert(/\p{Script=Arabic}/u.test(description || ''), `${route}: missing Arabic description`);

  const mains = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)];
  assert.equal(mains.length, 1, `${route}: expected a single main landmark`);
  assert.equal([...mains[0][1].matchAll(/<h1(?:\s[^>]*|)>/gi)].length, 1, `${route}: expected a single main h1`);
  assert(!/966569472778|18\.223791|42\.672173|shhala_sa|HHKEO63NHYYDP1/i.test(html),
    `${route}: contains an inherited restaurant contact or location`);

  const canonical = tagAttributes(html, 'link').filter(entry => entry.rel?.toLowerCase() === 'canonical');
  const robotsMeta = meta.find(entry => entry.name?.toLowerCase() === 'robots')?.content || '';
  const indexable = Boolean(siteUrl && route !== '/404.html');
  if (indexable) {
    assert.deepEqual(canonical.map(entry => entry.href), [new URL(route.slice(1), siteUrl).href],
      `${route}: missing or incorrect self-canonical URL`);
    assert(!/\bnoindex\b/i.test(robotsMeta), `${route}: production page is marked noindex`);
  } else {
    assert.equal(canonical.length, 0, `${route}: non-indexable page has a canonical URL`);
    assert.match(robotsMeta, /\bnoindex\b/i, `${route}: missing noindex directive`);
  }

  const schemaBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => attributes(attrs).type === 'application/ld+json')
    .map(([, , body]) => JSON.parse(body));
  const types = schemaTypes(schemaBlocks);
  const itemRoute = route.match(/^\/menu\/([^/]+)\/$/);
  if (indexable) {
    assert(schemaBlocks.length > 0, `${route}: missing production JSON-LD`);
    if (route === '/') {
      assert(types.includes('Restaurant') && types.includes('WebSite'), 'Home page must describe the restaurant and website');
    } else if (route === '/menu/') {
      assert(types.includes('Menu'), 'Menu page must include Menu structured data');
    } else if (itemRoute) {
      assert(types.includes('MenuItem'), `${route}: missing MenuItem structured data`);
    }
  }

  const current = new URL(`${base}${route.slice(1)}`, internalOrigin);
  const tags = [...html.matchAll(/<[a-z][\w:-]*\b(?:[^<>"']|"[^"]*"|'[^']*')*>/gi)]
    .map(([tag]) => attributes(tag));
  for (const { href, src, srcset, poster } of tags) {
    const sources = srcset?.startsWith('data:') ? [] : (srcset || '').split(',')
      .map(candidate => candidate.trim().split(/\s+/)[0]).filter(Boolean);
    for (const value of [href, src, poster, ...sources]) {
      const relative = localPath(value, current, route);
      if (relative === null) continue;
      assert(isFile(pageFile(`/${relative}`)), `${route}: broken local reference: ${value}`);
      internalReferences++;
    }
  }

  if (route === '/menu/') {
    const menuLinks = new Set(tagAttributes(html, 'a').map(({ href }) => localPath(href, current, route)));
    for (const { id } of items) {
      assert(menuLinks.has(`menu/${id}/`), `Menu is missing a crawlable link to ${id}`);
    }
  }
  if (itemRoute) {
    const { id, name } = itemById.get(itemRoute[1]);
    assert(decodeHtml(mains[0][1]).includes(name), `${route}: prerendered item name is missing`);
    const images = tagAttributes(html, 'img').map(({ src }) => localPath(src, current, route));
    assert(images.includes(`images/menu/${id}.webp`), `${route}: item image reference is missing`);
    const data = readFileSync(fromDist(`images/menu/${id}.webp`));
    assert(data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP',
      `${route}: item image is not a valid WebP container`);
  }
}

console.log(`Verified ${routes.length} static pages, ${items.length} menu photos, and ${internalReferences} local references (${siteUrl ? 'production' : 'staging'}).`);
