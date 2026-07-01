import { useTranslation } from 'react-i18next';
import SEO from '@/components/common/SEO';

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <>
    <SEO
      title="À propos de CoolZone"
      description="CoolZone est un spécialiste marocain de la climatisation premium. Sélection rigoureuse des plus grandes marques avec garantie constructeur et livraison rapide partout au Maroc."
      path="/about"
    />
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
    </>
  );
}
