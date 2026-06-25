import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/hooks/useUser';
import { getApiErrorMessage } from '@/hooks/useAuth';
import SectionHeader from './SectionHeader';

function Field({ label, hint, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">{label}</span>
      <input
        {...props}
        className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink disabled:opacity-50"
      />
      {hint && <span className="block mt-1 text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

export default function AccountProfile() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const update = useUpdateProfile();

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '' });
  }, [user]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setShowSaved(false);
    update.mutate(form, {
      onSuccess: () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2500);
      },
    });
  };

  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))
    : null;

  return (
    <div>
      <SectionHeader
        title={t('account.profile.title')}
        sub={t('account.profile.sub')}
        action={
          memberSince ? (
            <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {t('account.profile.member_since')} · {memberSince}
            </p>
          ) : null
        }
      />

      <form onSubmit={onSubmit} className="max-w-lg space-y-6">
        <Field
          label={t('auth.name')}
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={form.name}
          onChange={onChange}
        />
        <Field
          label={t('auth.email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
        />
        <Field
          label={t('auth.phone')}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={onChange}
        />

        {update.isError && (
          <p className="text-sm text-signal border-s-2 border-signal ps-3">
            {getApiErrorMessage(update.error)}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {update.isPending && <Loader2 size={14} className="animate-spin" />}
            {t('account.save')}
          </button>
          {showSaved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 size={14} strokeWidth={1.8} />
              {t('account.saved')}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
