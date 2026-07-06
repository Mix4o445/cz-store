import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HeroBanner() {
  const { t } = useTranslation();

  return (
    <section className="relative isolate overflow-hidden bg-ink text-paper">
      {/* Background video — covers the whole hero section. */}
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster=""
        aria-hidden="true"
      />

      {/* Readability overlay: dark gradient from the left so the text always
          sits on a slightly dimmer half of the frame, fading to transparent
          on the right so the video remains visible. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/25"
      />
      {/* Bottom vignette to anchor the strip text below the buttons. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-t from-ink/60 to-transparent"
      />

      <div className="container-app pt-16 md:pt-24 pb-20 md:pb-28 relative">
        <div className="max-w-3xl relative z-10">
          <h1 className="font-display font-medium text-display-lg lg:text-display-xl">
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="block"
            >
              {t('home.hero_title_a')}
            </motion.span>
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="block text-[#7C9CFF]"
            >
              {t('home.hero_title_b')}
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 max-w-xl text-base md:text-lg text-paper/80 leading-relaxed"
          >
            {t('home.hero_sub')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link to="/shop" className="btn-on-dark group">
              {t('home.hero_cta_primary')}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link
              to="/contact"
              className="btn border border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-ink transition-colors"
            >
              {t('home.hero_cta_secondary')}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="container-app relative z-10">
        <div className="hairline-dark" />
      </div>
    </section>
  );
}
