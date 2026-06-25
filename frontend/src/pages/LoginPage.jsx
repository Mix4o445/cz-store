import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useLogin, getApiErrorMessage } from '@/hooks/useAuth';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const [form, setForm] = useState({ email: '', password: '' });
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    login.mutate(form, {
      onSuccess: () => {
        const dest = location.state?.from ?? '/account';
        navigate(dest, { replace: true });
      },
    });
  };

  return (
    <section className="container-app py-16 md:py-24 grid md:grid-cols-12 gap-12 items-start">
      <div className="md:col-span-5">
        <p className="eyebrow mb-4">{t('login_page.eyebrow')}</p>
        <h1 className="font-display font-medium text-display-md mb-4">{t('auth.login')}.</h1>
        <p className="text-ink-muted text-sm max-w-sm">
          {t('login_page.sub')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="md:col-span-6 md:col-start-7 space-y-6">
        {location.state?.gated && (
          <p className="text-sm text-ink border-s-2 border-primary ps-3 bg-primary/5 py-2">
            {t('login_page.gated_hint')}
          </p>
        )}
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('auth.email')}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={onChange}
            className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{t('auth.password')}</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={form.password}
            onChange={onChange}
            className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
          />
        </label>

        {login.isError && (
          <p className="text-sm text-signal border-s-2 border-signal ps-3">
            {getApiErrorMessage(login.error)}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-4">
          <button
            type="submit"
            disabled={login.isPending}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {login.isPending && <Loader2 size={14} className="animate-spin" />}
            {t('auth.login')}
          </button>
          <Link to="/register" className="link-underline text-sm text-ink-muted hover:text-ink">
            {t('auth.no_account')}
          </Link>
        </div>
      </form>
    </section>
  );
}
