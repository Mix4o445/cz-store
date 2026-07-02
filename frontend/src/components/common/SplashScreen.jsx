import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';

const HOLD_MS = 2000; // 2 seconds, as requested

/**
 * First-paint brand splash. Renders on top of the app for HOLD_MS, then
 * fades out so the page is visible. Persists "shown" in sessionStorage so
 * it only shows once per browser session (i.e. on the first navigation,
 * not on every page change or refresh).
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('coolzone-splash-shown');
  });

  useEffect(() => {
    if (!visible) return undefined;
    sessionStorage.setItem('coolzone-splash-shown', '1');
    const t = setTimeout(() => setVisible(false), HOLD_MS);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-paper"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-8 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo className="h-12 md:h-14" />
            </motion.div>

            {/* Slim progress bar that fills in over the hold window. */}
            <div className="w-40 md:w-56 h-px bg-line overflow-hidden">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
                style={{ transformOrigin: 'left center' }}
                className="block h-full w-full bg-ink"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
