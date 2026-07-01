import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/formatPrice';

const AUTO_DISMISS_MS = 3500;

export default function CartToast() {
  const { t } = useTranslation();
  const toast = useUIStore((s) => s.cartToast);
  const hide = useUIStore((s) => s.hideCartToast);
  const timer = useRef(null);

  // Auto-dismiss after a short window. Reset the timer if a new toast arrives
  // (the `id` changes, so the effect re-runs).
  useEffect(() => {
    if (!toast) return undefined;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(hide, AUTO_DISMISS_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast, hide]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-16 md:top-20 z-50 flex justify-center md:justify-end md:pe-6 px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full max-w-sm"
            role="status"
          >
            <div className="relative bg-paper border border-line shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden">
              {/* Slim accent bar that fills in to confirm the action */}
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                style={{ transformOrigin: 'left center' }}
                className="absolute inset-x-0 top-0 h-px bg-ink/30"
              />

              <div className="flex items-center gap-3 p-3.5 pr-2">
                {/* Thumbnail + success badge */}
                <div className="relative shrink-0 w-12 h-12 bg-chrome rounded-xl overflow-hidden flex items-center justify-center">
                  {toast.image ? (
                    <img
                      src={toast.image}
                      alt=""
                      aria-hidden
                      className="w-full h-full object-contain p-1 mix-blend-multiply"
                    />
                  ) : null}
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.08, type: 'spring', stiffness: 500, damping: 22 }}
                    className="absolute -bottom-1 -end-1 grid place-items-center w-5 h-5 rounded-full bg-ink text-paper"
                    aria-hidden
                  >
                    <Check size={11} strokeWidth={2.4} />
                  </motion.span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider-2 text-ink-muted leading-none">
                    {t('cart.added')}
                  </p>
                  <p className="mt-1 text-sm font-medium truncate">{toast.name}</p>
                  <p className="text-[11px] text-ink-muted num">
                    {toast.qty > 1 ? `${toast.qty} × ` : ''}
                    {formatPrice(toast.price)}
                  </p>
                </div>

                <Link
                  to="/cart"
                  onClick={hide}
                  className="shrink-0 text-[11px] uppercase tracking-wider-1 font-semibold text-ink hover:text-primary px-2 py-1"
                >
                  {t('cart.view')}
                </Link>
                <button
                  type="button"
                  onClick={hide}
                  aria-label={t('cart.dismiss')}
                  className="shrink-0 grid place-items-center w-7 h-7 rounded-full text-ink-muted hover:text-ink hover:bg-ink/5"
                >
                  <X size={13} strokeWidth={1.6} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
