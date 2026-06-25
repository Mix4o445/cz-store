import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <section className="container-app py-16 md:py-24 grid md:grid-cols-12 gap-12 items-start">
      <div className="md:col-span-5 space-y-8">
        <div>
          <p className="eyebrow mb-4">{t('contact.eyebrow')}</p>
          <h1 className="font-display font-medium text-display-md">{t('contact.title')}</h1>
          <p className="text-ink-muted text-base mt-4 max-w-md">{t('contact.sub')}</p>
        </div>
        <ul className="space-y-4 text-sm">
          <li className="flex items-center gap-3 text-ink-muted">
            <Phone size={15} strokeWidth={1.4} /> {t('contact.phone_label')}
          </li>
          <li className="flex items-center gap-3 text-ink-muted">
            <Mail size={15} strokeWidth={1.4} /> contact@coolzone.ma
          </li>
          <li className="flex items-center gap-3 text-ink-muted">
            <MapPin size={15} strokeWidth={1.4} /> {t('contact.city_label')}
          </li>
        </ul>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="md:col-span-6 md:col-start-7 space-y-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('contact.name')}</span>
          <input type="text" required className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('contact.email')}</span>
          <input type="email" required className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('contact.message')}</span>
          <textarea rows={5} required className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink resize-none" />
        </label>
        <button type="submit" className="btn-primary">{t('contact.send')}</button>
      </form>
    </section>
  );
}
