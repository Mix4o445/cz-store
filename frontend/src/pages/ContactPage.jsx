import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { useSendContact } from '@/hooks/useContact';
import { getApiErrorMessage } from '@/hooks/useAuth';

const EMPTY = { name: '', email: '', message: '' };

export default function ContactPage() {
  const { t } = useTranslation();
  const send = useSendContact();
  const [form, setForm] = useState(EMPTY);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (done) setDone(false);
    if (error) setError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    send.mutate(form, {
      onSuccess: () => {
        setDone(true);
        setForm(EMPTY);
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    });
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Contactez CoolZone pour un devis, une question ou un projet de climatisation. Basés à Casablanca, livraison partout au Maroc."
        path="/contact"
      />
      <section className="container-app py-16 md:py-24 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5 space-y-8">
          <div>
            <p className="eyebrow mb-4">{t('contact.eyebrow')}</p>
            <h1 className="font-display font-medium text-display-md">{t('contact.title')}</h1>
            <p className="text-ink-muted text-base mt-4 max-w-md">{t('contact.sub')}</p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3 text-ink-muted">
              <Phone size={15} strokeWidth={1.4} />
              <a
                href="tel:+212663820045"
                className="hover:text-ink transition-colors"
              >
                {t('contact.phone_label')}
              </a>
            </li>
            <li className="flex items-center gap-3 text-ink-muted">
              <Mail size={15} strokeWidth={1.4} />
              <a
                href="mailto:contact@coolzone.ma"
                className="hover:text-ink transition-colors"
              >
                contact@coolzone.ma
              </a>
            </li>
            <li className="flex items-center gap-3 text-ink-muted">
              <MapPin size={15} strokeWidth={1.4} /> {t('contact.city_label')}
            </li>
          </ul>
        </div>

        <form
          onSubmit={onSubmit}
          className="md:col-span-6 md:col-start-7 space-y-6"
          noValidate
        >
          {done && (
            <div
              role="status"
              className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 rounded-xl"
            >
              <CheckCircle2 size={18} strokeWidth={1.8} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{t('contact.success_title')}</p>
                <p className="text-emerald-800/80 mt-0.5">
                  {t('contact.success_sub')}
                </p>
              </div>
            </div>
          )}

          <label className="block">
            <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {t('contact.name')}
            </span>
            <input
              type="text"
              name="name"
              required
              minLength={1}
              maxLength={120}
              autoComplete="name"
              value={form.name}
              onChange={onChange}
              className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {t('contact.email')}
            </span>
            <input
              type="email"
              name="email"
              required
              maxLength={200}
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {t('contact.message')}
            </span>
            <textarea
              name="message"
              required
              minLength={5}
              maxLength={5000}
              rows={5}
              value={form.message}
              onChange={onChange}
              className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink resize-none"
            />
          </label>

          {error && (
            <p className="text-sm text-signal border-s-2 border-signal ps-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={send.isPending}
            className="btn-primary inline-flex items-center gap-2"
          >
            {send.isPending && <Loader2 size={14} className="animate-spin" />}
            {t('contact.send')}
          </button>
        </form>
      </section>
    </>
  );
}
