import { useTranslation } from 'react-i18next';
import Reveal from '@/components/common/Reveal';

export default function Manifesto() {
  const { t } = useTranslation();

  const ticker = [
    t('home.ticker_a'),
    t('home.ticker_b'),
    t('home.ticker_c'),
    t('home.ticker_d'),
  ];

  return (
    <section className="section-tight">
      <div className="container-app">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow">{t('home.manifesto_eyebrow')}</p>
          </Reveal>

          <div className="lg:col-span-9">
            <Reveal delay={0.05}>
              <h2 className="font-display font-medium text-display-md max-w-4xl">
                {t('home.manifesto_title')}
              </h2>
            </Reveal>

            <div className="mt-10 grid md:grid-cols-2 gap-8 max-w-4xl text-base md:text-lg text-ink-muted leading-relaxed">
              <Reveal delay={0.15} as="p">
                {t('home.manifesto_p1')}
              </Reveal>
              <Reveal delay={0.25} as="p">
                {t('home.manifesto_p2')}
              </Reveal>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 items-center text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {ticker.map((w, i) => (
                <Reveal key={i} delay={0.3 + i * 0.05} y={12} as="span" className="flex items-center gap-3">
                  <span className="num text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                  <span>{w}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
