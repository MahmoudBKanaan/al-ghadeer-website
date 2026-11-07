export function resolveSiteUrl() {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return null;
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.search || url.hash || url.username || url.password ||
      /^(localhost|127\.|\[|.*\.invalid$|example\.(com|org|net)$)/i.test(url.hostname)) {
    throw new Error('SITE_URL must be the public HTTPS site URL, without credentials, a query, or a fragment.');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}

export function resolveBase() {
  const site = resolveSiteUrl();
  const raw = process.env.BASE_PATH?.trim() || site?.pathname || '/';
  const base = `${raw.replace(/\/+$/, '')}/`;
  if (!/^\/(?:[\w.-]+\/)*$/.test(base) || /(?:^|\/)\.{1,2}(?:\/|$)/.test(base)) {
    throw new Error('BASE_PATH must be / or a path such as /restaurant/.');
  }
  if (site && base !== site.pathname) throw new Error('BASE_PATH must match the pathname of SITE_URL.');
  return base;
}
