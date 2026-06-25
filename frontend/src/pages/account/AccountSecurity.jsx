import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useChangePassword } from '@/hooks/useUser';
import { getApiErrorMessage } from '@/hooks/useAuth';
import SectionHeader from './SectionHeader';

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{label}</span>
      <input
        {...props}
        className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink"
      />
    </label>
  );
}

export default function AccountSecurity() {
  const { t } = useTranslation();
  const change = useChangePassword();
  const [form, setForm] = useState({ current: '', next: '' });
  const [showSaved, setShowSaved] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setShowSaved(false);
    change.mutate(form, {
      onSuccess: () => {
        setShowSaved(true);
        setForm({ current: '', next: '' });
        setTimeout(() => setShowSaved(false), 2500);
      },
    });
  };

  return (
    <div className="space-y-16">
      <SectionHeader title={t('account.security.title')} sub={t('account.security.sub')} />

      {/* Change password */}
      <section>
        <h3 className="font-display text-lg font-medium mb-5">{t('account.security.change_password')}</h3>
        <form onSubmit={onSubmit} className="max-w-md space-y-6">
          <Field
            label={t('account.security.current_password')}
            name="current"
            type="password"
            required
            autoComplete="current-password"
            value={form.current}
            onChange={onChange}
          />
          <Field
            label={t('account.security.new_password')}
            name="next"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={form.next}
            onChange={onChange}
          />

          {change.isError && (
            <p className="text-sm text-signal border-s-2 border-signal ps-3">
              {getApiErrorMessage(change.error)}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={change.isPending}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              {change.isPending && <Loader2 size={14} className="animate-spin" />}
              {t('account.security.change_password')}
            </button>
            {showSaved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle2 size={14} strokeWidth={1.8} />
                {t('account.security.password_updated')}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border border-signal/30 bg-signal/5 p-6 max-w-2xl">
        <p className="text-[11px] uppercase tracking-wider-2 text-signal flex items-center gap-2">
          <AlertTriangle size={13} strokeWidth={1.8} />
          {t('account.security.danger_zone')}
        </p>
        <h3 className="font-display text-xl font-medium mt-3">{t('account.security.delete_account')}</h3>
        <p className="text-ink-muted text-sm mt-2 max-w-md">
          {t('account.security.delete_account_warning')}
        </p>
        <button
          onClick={() => alert(t('account.security.delete_account_warning'))}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-signal/40 text-signal hover:bg-signal hover:text-paper transition-colors text-sm font-medium"
        >
          {t('account.security.delete_account')}
        </button>
      </section>
    </div>
  );
}
