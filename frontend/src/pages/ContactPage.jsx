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

          <a
            href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '+212663820045').replace(/[^\d]/g, '')}?text=${encodeURIComponent('Bonjour, je vous contacte depuis le site web CoolZone…')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe5b] transition-colors shadow-soft"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.13 1.6 5.93L0 24l6.39-1.68a11.84 11.84 0 0 0 5.65 1.44h.01c6.55 0 11.85-5.3 11.85-11.84a11.79 11.79 0 0 0-3.38-8.44ZM12.04 21.5h-.01a9.65 9.65 0 0 1-4.92-1.35l-.35-.21-3.79 1 1-3.69-.23-.38a9.66 9.66 0 0 1-1.48-5.13c0-5.34 4.35-9.68 9.69-9.68a9.62 9.62 0 0 1 6.85 2.84 9.6 9.6 0 0 1 2.83 6.85c0 5.34-4.34 9.69-9.59 9.75Zm5.55-7.25c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51l-.58-.01c-.2 0-.53.07-.81.38-.28.3-1.07 1.05-1.07 2.55s1.1 2.96 1.25 3.16c.15.2 2.16 3.3 5.23 4.62.73.31 1.3.5 1.74.64.73.23 1.39.2 1.92.12.59-.09 1.79-.73 2.04-1.43.25-.7.25-1.3.18-1.43-.07-.13-.27-.2-.57-.35Z" />
            </svg>
            {t('contact.whatsapp_cta')}
          </a>
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
