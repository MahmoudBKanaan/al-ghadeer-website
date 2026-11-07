import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { resolveBase, resolveSiteUrl } from './settings.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const outputName = process.env.DIST_DIR || 'dist';
if (!/^dist(?:-[\w]+)?$/.test(outputName)) throw new Error('DIST_DIR must be dist or a name such as dist-release.');
const output = resolve(project, outputName);
const siteUrl = resolveSiteUrl();
const base = resolveBase();
const temporary = await mkdtemp(join(project, '.static-render-'));

try {
  await build({ root: project, build: { outDir: output, emptyOutDir: true } });
  await build({ root: project, build: {
    ssr: 'src/prerender.jsx', outDir: temporary, emptyOutDir: true, copyPublicDir: false,
  } });

  const template = await readFile(join(output, 'index.html'), 'utf8');
  if (!template.includes('<!-- PAGE_HEAD -->') || !template.includes('<div id="root"></div>')) {
    throw new Error('Vite output lost its static template markers.');
  }
  const { renderPages } = await import(pathToFileURL(join(temporary, 'prerender.js')).href);
  const pages = renderPages(template, siteUrl);
  for (const { path, html } of pages) {
    const file = join(output, path.slice(1), path.endsWith('/') ? 'index.html' : '');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }

  const sitemap = siteUrl ? `Sitemap: ${new URL('sitemap.xml', siteUrl).href}\n` : '';
  await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\n${sitemap}`);
  if (siteUrl) {
    const urls = pages.filter(page => page.path !== '/404.html').map(({ path }) => {
      const url = new URL(path.slice(1), siteUrl).href.replace(/&/g, '&amp;');
      return `  <url><loc>${url}</loc></url>`;
    });
    await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  }
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(join(output, 'build-info.json'), `${JSON.stringify({ base, siteUrl: siteUrl?.href || null, routes: pages.map(page => page.path) }, null, 2)}\n`);
  console.log(`Rendered ${pages.length} pages in ${outputName}/ (${siteUrl ? 'production' : 'staging; noindex'}).`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
