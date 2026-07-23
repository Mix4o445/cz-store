import { useEffect, useRef, useState } from 'react';
import { Handshake, MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildWhatsAppUrl } from '@/components/common/WhatsAppContactButton';
import { formatPrice } from '@/utils/formatPrice';

export default function NegotiationDialog({
  productName,
  productSlug,
  currentPrice,
  variantLabel,
  onClose,
}) {
  const { t } = useTranslation();
  const [offer, setOffer] = useState('');
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const offerValue = Number(offer);
  const isValidOffer = Number.isFinite(offerValue) && offerValue > 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href]'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const sendOffer = () => {
    if (!isValidOffer) return;

    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '+212663820045';
    const productUrl = `${window.location.origin}/product/${productSlug}`;
    const message = t('product.negotiation_message', {
      name: productName,
      variant: variantLabel || t('product.standard'),
      currentPrice: formatPrice(currentPrice),
      offerPrice: formatPrice(offerValue),
      url: productUrl,
    });

    window.open(buildWhatsAppUrl(number, message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end bg-ink/55 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="negotiation-title"
        aria-describedby="negotiation-description"
        className="w-full max-w-lg rounded-t-3xl bg-paper shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Handshake size={21} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider-2 text-ink-muted">
                {t('product.negotiation_eyebrow')}
              </p>
              <h2 id="negotiation-title" className="mt-1 text-xl font-medium">
                {t('product.negotiation_title')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-chrome hover:text-ink"
            aria-label={t('product.negotiation_close')}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <form
          className="space-y-6 px-6 py-6 sm:px-8 sm:py-8"
          onSubmit={(event) => {
            event.preventDefault();
            sendOffer();
          }}
        >
          <div className="rounded-2xl bg-chrome p-4">
            <p className="font-medium leading-snug">{productName}</p>
            {variantLabel && (
              <p className="mt-1 text-xs text-ink-muted">{variantLabel}</p>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
              <span className="text-xs uppercase tracking-wider-1 text-ink-muted">
                {t('product.negotiation_current_price')}
              </span>
              <span className="price text-lg">{formatPrice(currentPrice)}</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="negotiation-offer"
              className="text-[11px] font-medium uppercase tracking-wider-2 text-ink-muted"
            >
              {t('product.negotiation_offer_label')}
            </label>
            <div className="mt-2 flex items-center border-b-2 border-ink px-1">
              <input
                ref={inputRef}
                id="negotiation-offer"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={offer}
                onChange={(event) => setOffer(event.target.value)}
                placeholder={t('product.negotiation_offer_placeholder')}
                className="num min-w-0 flex-1 bg-transparent py-3 text-2xl font-semibold outline-none placeholder:text-ink/25"
              />
              <span className="text-sm font-medium text-ink-muted">MAD</span>
            </div>
            <p id="negotiation-description" className="mt-3 text-sm leading-relaxed text-ink-muted">
              {t('product.negotiation_hint')}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValidOffer}
            className="btn-primary w-full"
          >
            <MessageCircle size={17} aria-hidden="true" />
            {t('product.negotiation_send')}
          </button>
        </form>
      </section>
    </div>
  );
}
