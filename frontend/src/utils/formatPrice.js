export function formatPrice(value, { currency = 'MAD', locale = 'fr-MA' } = {}) {
  if (value == null || isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}
