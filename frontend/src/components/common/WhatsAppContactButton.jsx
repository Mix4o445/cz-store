import { useTranslation } from 'react-i18next';

/**
 * Build a wa.me URL with a pre-filled message. Strip the `+` and any
 * non-digit characters from the number.
 */
export function buildWhatsAppUrl(number, message = '') {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '#';
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/**
 * Inline "Contactez-nous" CTA that opens WhatsApp in a new tab. Use this
 * anywhere you'd render a price for a `contactOnly` product so the user
 * can reach sales directly. The button is intentionally not a <button>:
 * it's an <a target="_blank"> so middle-click / cmd-click still works and
 * screen readers announce it as a link.
 */
export default function WhatsAppContactButton({
  product,
  className = '',
  size = 'md',
  fullWidth = false,
}) {
  const { t } = useTranslation();
  const number = (
    import.meta.env.VITE_WHATSAPP_NUMBER || '+212663820045'
  ).replace(/\D/g, '');

  const productName =
    (typeof product?.name === 'string' ? product.name : product?.name?.fr) || '';
  const slug = product?.slug || '';
  const url = slug ? `${window.location.origin}/product/${slug}` : window.location.origin;

  const message = t('product.whatsapp_message', {
    name: productName,
    url,
  });
  const href = buildWhatsAppUrl(number, message);

  const sizes = {
    sm: 'text-[11px] px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
        'bg-[#25D366] text-white hover:bg-[#1ebe5b] transition-colors ' +
        sizes[size] +
        (fullWidth ? ' w-full' : '') +
        (className ? ' ' + className : '')
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        width={size === 'lg' ? 18 : 16}
        height={size === 'lg' ? 18 : 16}
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.68a11.84 11.84 0 0 0 5.65 1.44h.01c6.55 0 11.85-5.3 11.85-11.84a11.79 11.79 0 0 0-3.38-8.44ZM12.04 21.5h-.01a9.65 9.65 0 0 1-4.92-1.35l-.35-.21-3.79 1 1-3.69-.23-.38a9.66 9.66 0 0 1-1.48-5.13c0-5.34 4.35-9.68 9.69-9.68a9.62 9.62 0 0 1 6.85 2.84 9.6 9.6 0 0 1 2.83 6.85c0 5.34-4.34 9.69-9.59 9.75Zm5.55-7.25c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.53.07-.81.38-.28.3-1.07 1.05-1.07 2.55s1.1 2.96 1.25 3.16c.15.2 2.16 3.3 5.23 4.62.73.31 1.3.5 1.74.64.73.23 1.39.2 1.92.12.59-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      {t('product.contact_us')}
    </a>
  );
}
