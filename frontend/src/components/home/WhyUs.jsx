import { useTranslation } from 'react-i18next';
import Reveal from '@/components/common/Reveal';

export default function WhyUs() {
  const { t } = useTranslation();
  const items = [
    { n: '01', title: t('why.warranty_title'), text: t('why.warranty_text') },
    { n: '02', title: t('why.delivery_title'), text: t('why.delivery_text') },
    { n: '03', title: t('why.support_title'), text: t('why.support_text') },
    { n: '04', title: t('why.price_title'), text: t('why.price_text') },
  ];

  return (
    <section className="section section-chrome">
      <div className="container-app">
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-16 items-end">
          <Reveal className="md:col-span-6">
            <p className="eyebrow mb-4">{t('home.why_eyebrow')}</p>
            <h2 className="font-display font-medium text-display-md">{t('home.why_title')}</h2>
          </Reveal>
        </div>

        <ol className="grid md:grid-cols-2 gap-x-12 gap-y-12">
          {items.map((it, i) => (
            <Reveal as="li" key={it.n} delay={i * 0.1} className="grid grid-cols-[auto_1fr] gap-6">
              <span className="num text-sm text-ink-muted leading-[1.6]">{it.n}</span>
              <div className="border-t border-ink/15 pt-5">
                <h3 className="font-display text-2xl md:text-3xl font-medium leading-tight">
                  {it.title}
                </h3>
                <p className="text-base text-ink-muted leading-relaxed mt-3 max-w-md">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
