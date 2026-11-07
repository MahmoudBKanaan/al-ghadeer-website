import { renderToString } from 'react-dom/server';
import { App, allRoutes } from './site.jsx';
import { categories, itemPath, variantsFor } from './catalog.js';
import { href, restaurant } from './config.js';

const arabicLocale = 'ar-SA';
const schemaContext = 'https://schema.org';

function absolute(path, siteUrl) {
  return new URL(path.replace(/^\//, ''), siteUrl).href;
}

function menuItemSchema(item, siteUrl) {
  const variants = variantsFor(item);
  const url = absolute(itemPath(item), siteUrl);
  return {
    '@type': 'MenuItem',
    '@id': `${url}#item`,
    name: item.name,
    description: item.description,
    image: absolute(`/images/menu/${item.id}.webp`, siteUrl),
    url,
    ...(variants.length ? { offers: variants.map(({ price, name }) => ({
      '@type': 'Offer',
      name,
      price,
      priceCurrency: restaurant.currency,
      url: `${url}#sizes`,
    })) } : {}),
  };
}

function restaurantSchema(siteUrl) {
  const home = absolute('/', siteUrl);
  const profiles = Object.values(restaurant.social).filter(Boolean);
  return {
    '@type': 'Restaurant',
    '@id': `${home}#restaurant`,
    name: restaurant.name,
    alternateName: restaurant.searchAliases,
    url: home,
    telephone: restaurant.phoneInternational,
    image: absolute('/images/brand/hero.webp', siteUrl),
    logo: absolute('/images/brand/logo.png', siteUrl),
    address: { '@type': 'PostalAddress', addressLocality: restaurant.city, addressCountry: 'SA' },
    areaServed: { '@type': 'City', name: restaurant.city },
    servesCuisine: ['مشويات', 'أطباق شرقية'],
    hasMenu: absolute('/menu/', siteUrl),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `${schemaContext}/${day}`),
      opens: restaurant.opens,
      closes: restaurant.closes,
    },
    ...(profiles.length ? { sameAs: profiles } : {}),
    ...(restaurant.exactMapUrl ? { hasMap: restaurant.exactMapUrl } : {}),
  };
}

const breadcrumbLabels = { story: 'قصتنا', menu: 'قائمة الطعام', locations: 'الفروع', contact: 'تواصل معنا' };

function schemaFor(route, siteUrl) {
  const home = absolute('/', siteUrl);
  const url = absolute(route.path, siteUrl);
  const site = `${home}#website`;
  const business = `${home}#restaurant`;
  const graph = [];
  if (route.key === 'home') {
    graph.push({ '@type': 'WebSite', '@id': site, name: restaurant.name,
      alternateName: restaurant.searchAliases, inLanguage: arabicLocale, url: home, publisher: { '@id': business } }, restaurantSchema(siteUrl));
  }
  const page = {
    '@type': { contact: 'ContactPage', story: 'AboutPage', menu: 'CollectionPage' }[route.key] || 'WebPage',
    '@id': `${url}#page`, url, name: route.title, description: route.description,
    inLanguage: arabicLocale, isPartOf: { '@id': site }, about: { '@id': business },
  };
  graph.push(page);

  if (route.key !== 'home') {
    const crumbs = [{ name: 'الرئيسية', url: home }];
    if (route.item) {
      const menuUrl = absolute('/menu/', siteUrl);
      crumbs.push({ name: 'قائمة الطعام', url: menuUrl }, { name: route.item.categoryName, url: `${menuUrl}#${route.item.categoryId}` });
    }
    crumbs.push({ name: route.item?.name || breadcrumbLabels[route.key], url });
    const breadcrumbId = `${url}#breadcrumbs`;
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: crumbs.map(({ name, url }, index) => ({
      '@type': 'ListItem', position: index + 1, name, item: url,
    })) });
    page.breadcrumb = { '@id': breadcrumbId };
  }

  if (route.key === 'menu') {
    const menuId = `${url}#menu`;
    page.mainEntity = { '@id': menuId };
    graph.push({
      '@type': 'Menu', '@id': menuId, name: `قائمة ${restaurant.name}`, url, inLanguage: arabicLocale,
      hasMenuSection: categories.map(category => ({
        '@type': 'MenuSection', name: category.name, url: `${url}#${category.id}`,
        hasMenuItem: category.items.map(item => menuItemSchema(item, siteUrl)),
      })),
    });
  }
  if (route.item) {
    const menuItem = menuItemSchema(route.item, siteUrl);
    page.mainEntity = { '@id': menuItem['@id'] };
    graph.push(menuItem);
  }
  return { '@context': schemaContext, '@graph': graph };
}

const htmlChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(value) { return value.replace(/[&<>"']/g, char => htmlChars[char]); }
function meta(name, value, attribute = 'name') { return `<meta ${attribute}="${name}" content="${escapeHtml(value)}">`; }

function pageHead(route, siteUrl) {
  const head = [
    meta('description', route.description),
    `<link rel="icon" href="${href('/images/brand/logo.svg')}" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="${href('/images/brand/logo.png')}">`,
    meta('theme-color', '#F8F7F5'),
  ];
  if (!siteUrl || route.key === '404') return [...head, meta('robots', 'noindex, follow')].join('\n    ');

  const url = absolute(route.path, siteUrl);
  const image = route.item ? `/images/menu/${route.item.id}.webp` : '/images/brand/hero.webp';
  const alt = route.item ? `صورة توضيحية لصنف ${route.item.name}` : 'صورة توضيحية لمشويات مطعم الغدير';
  return [...head,
    meta('robots', 'index, follow, max-image-preview:large'),
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    ...Object.entries({
      'og:type': 'website', 'og:locale': 'ar_SA', 'og:site_name': restaurant.name,
      'og:title': route.title, 'og:description': route.description, 'og:url': url,
      'og:image': absolute(image, siteUrl), 'og:image:alt': alt,
    }).map(([name, value]) => meta(name, value, 'property')),
    meta('twitter:card', 'summary_large_image'),
    `<script type="application/ld+json">${JSON.stringify(schemaFor(route, siteUrl)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
}

export function renderPages(template, siteUrl) {
  return allRoutes().map(route => ({
    path: route.path,
    html: template
      .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(route.title)}</title>`)
      .replace('<!-- PAGE_HEAD -->', () => pageHead(route, siteUrl))
      .replace('<div id="root"></div>', () => `<div id="root">${renderToString(<App route={route} />)}</div>`),
  }));
}
