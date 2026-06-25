import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import heroImage from '@/assets/hero-image.png';

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
    <section className="relative overflow-hidden">
      <div className="container-app pt-12 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-6 relative z-10">
          <motion.p variants={fadeUp} initial="hidden" animate="show" className="eyebrow mb-8">
            {t('home.hero_eyebrow')}
          </motion.p>

          <h1 className="font-display font-medium text-display-lg lg:text-display-xl">
            <motion.span variants={fadeUp} initial="hidden" animate="show" custom={1} className="block">
              {t('home.hero_title_a')}
            </motion.span>
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="block text-[#2E4C9B]"
            >
              {t('home.hero_title_b')}
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 max-w-xl text-base md:text-lg text-ink-muted leading-relaxed"
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
            <Link to="/shop" className="btn-primary group">
              {t('home.hero_cta_primary')}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link to="/contact" className="btn-outline">
              {t('home.hero_cta_secondary')}
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-12 text-[11px] uppercase tracking-wider-2 text-ink-muted font-medium"
          >
            {t('home.hero_strip')}
          </motion.p>
        </div>

        {/* Right: visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative w-full"
        >
          <motion.img
            src={heroImage}
            alt=""
            className="w-full h-auto max-h-[560px] object-contain select-none pointer-events-none"
            draggable={false}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Index labels around the visual */}
          
        </motion.div>
      </div>

      {/* Bottom hairline */}
      <div className="container-app">
        <div className="hairline" />
      </div>
    </section>
  );
}
