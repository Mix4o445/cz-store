import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/common/SEO';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <SEO
        title="Page introuvable"
        description="La page que vous cherchez n'existe pas ou a été déplacée."
        path="/404"
        noindex
      />
      <section className="container-app py-32 text-center space-y-6">
        <p className="font-display font-medium text-display-xl text-ink/10 leading-none select-none">
          404
        </p>
        <h1 className="font-display font-medium text-display-sm">{t('notfound.title')}</h1>
        <p className="text-ink-muted text-sm max-w-sm mx-auto">{t('notfound.sub')}</p>
        <Link to="/" className="btn-primary inline-flex">{t('notfound.back')}</Link>
      </section>
    </>
  );
}
