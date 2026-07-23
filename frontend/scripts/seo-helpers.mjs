const DEFAULT_SITE_URL = 'https://www.coolzone.ma';

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  try {
    const url = new URL(String(value || DEFAULT_SITE_URL));
    if (url.hostname === 'coolzone.ma') url.hostname = 'www.coolzone.ma';
    return url.origin.replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function apiCandidates(siteUrl) {
  const configured = String(
    process.env.SEO_API_URL || process.env.VITE_API_URL || ''
  ).replace(/\/+$/, '');
  const publicApi = `${siteUrl}/api`;
  const isLocal = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(configured);
  const candidates = isLocal
    ? [publicApi, configured]
    : [configured, publicApi];

  return [...new Set(candidates.filter(Boolean))];
}

export async function fetchApi(path, siteUrl, { timeout = 8000 } = {}) {
  const failures = [];

  for (const baseUrl of apiCandidates(siteUrl)) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(timeout),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      return json?.data ?? json;
    } catch (error) {
      failures.push(`${baseUrl}: ${error.message}`);
    }
  }

  throw new Error(`Unable to fetch ${path} (${failures.join('; ')})`);
}

export function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

export function htmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
