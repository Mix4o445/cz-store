import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <section className="container-app py-16 md:py-24 grid md:grid-cols-12 gap-10 items-start">
      <div className="md:col-span-4">
        <p className="eyebrow mb-4">{t('about.eyebrow')}</p>
      </div>
      <div className="md:col-span-8 space-y-8 max-w-3xl">
        <h1 className="font-display font-medium text-display-md">{t('about.title')}</h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed">{t('about.p1')}</p>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed">{t('about.p2')}</p>
      </div>
    </section>
  );
}
