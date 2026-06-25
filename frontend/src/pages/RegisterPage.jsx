import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useRegister, getApiErrorMessage } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    register.mutate(form, {
      onSuccess: () => navigate('/account', { replace: true }),
    });
  };

  return (
    <section className="container-app py-16 md:py-24 grid md:grid-cols-12 gap-12 items-start">
      <div className="md:col-span-5">
        <p className="eyebrow mb-4">{t('register_page.eyebrow')}</p>
        <h1 className="font-display font-medium text-display-md mb-4">{t('auth.register')}.</h1>
        <p className="text-ink-muted text-sm max-w-sm">
          {t('register_page.sub')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="md:col-span-6 md:col-start-7 space-y-6">
        {[
          { name: 'name', type: 'text', label: t('auth.name'), autoComplete: 'name', required: true, minLength: 2 },
          { name: 'email', type: 'email', label: t('auth.email'), autoComplete: 'email', required: true },
          { name: 'phone', type: 'tel', label: t('auth.phone'), autoComplete: 'tel' },
          { name: 'password', type: 'password', label: t('auth.password'), autoComplete: 'new-password', required: true, minLength: 6, hint: t('register_page.password_hint') },
        ].map((f) => (
          <label key={f.name} className="block">
            <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{f.label}</span>
            <input
              type={f.type}
              name={f.name}
              autoComplete={f.autoComplete}
              required={f.required}
              minLength={f.minLength}
              value={form[f.name]}
              onChange={onChange}
              className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
            />
            {f.hint && <span className="block mt-1 text-[11px] text-ink-muted">{f.hint}</span>}
          </label>
        ))}

        {register.isError && (
          <p className="text-sm text-signal border-s-2 border-signal ps-3">
            {getApiErrorMessage(register.error)}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-4">
          <button
            type="submit"
            disabled={register.isPending}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {register.isPending && <Loader2 size={14} className="animate-spin" />}
            {t('auth.register')}
          </button>
          <Link to="/login" className="link-underline text-sm text-ink-muted hover:text-ink">
            {t('auth.have_account')}
          </Link>
        </div>
      </form>
    </section>
  );
}
