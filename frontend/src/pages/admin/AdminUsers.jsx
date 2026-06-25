import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck, ShieldOff, Search } from 'lucide-react';
import { useAdminUsers, useSetUserRole } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/hooks/useAuth';

export default function AdminUsers() {
  const { t } = useTranslation();
  const me = useAuthStore((s) => s.user);
  const [q, setQ] = useState('');
  const { data: users = [], isLoading, isError, error, refetch } = useAdminUsers(q);
  const setRole = useSetUserRole();

  const fmt = (date) =>
    date
      ? new Intl.DateTimeFormat('fr-MA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(date))
      : '';

  return (
    <div>
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-line pb-5 mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium">{t('admin.users.title')}</h2>
          <p className="text-ink-muted text-sm mt-1">{t('admin.users.sub')}</p>
        </div>
        <div className="flex items-center gap-2 border-b border-ink/20 focus-within:border-ink py-1 w-full sm:w-72">
          <Search size={14} strokeWidth={1.6} className="text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('admin.users.search')}
            className="flex-1 bg-transparent outline-none text-sm py-1"
          />
        </div>
      </header>

      {isLoading && (
        <div className="grid place-items-center py-12 text-ink-muted">
          <Loader2 size={26} className="animate-spin" />
        </div>
      )}

      {isError && (
        <div className="border border-line p-6 text-center text-sm">
          <p className="text-signal mb-3">{getApiErrorMessage(error, t('common.error'))}</p>
          <button onClick={() => refetch()} className="btn-outline">{t('common.retry')}</button>
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div className="border border-line p-12 text-center text-sm text-ink-muted">
          {t('admin.users.empty')}
        </div>
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
                <th className="text-start font-medium py-3 px-6 md:px-0">{t('auth.name')}</th>
                <th className="text-start font-medium py-3">{t('auth.email')}</th>
                <th className="text-start font-medium py-3">{t('admin.users.role')}</th>
                <th className="text-start font-medium py-3">{t('account.profile.member_since')}</th>
                <th className="py-3 text-end pe-6 md:pe-0"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-y border-line">
              {users.map((u) => {
                const isSelf = u._id === me?._id;
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u._id}>
                    <td className="py-3 ps-6 md:ps-0 pe-3 font-medium">{u.name}</td>
                    <td className="py-3 pe-3 text-ink-muted">{u.email}</td>
                    <td className="py-3 pe-3">
                      <span
                        className={`tag ${isAdmin ? 'bg-ink text-paper' : 'bg-line text-ink-muted'}`}
                      >
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 pe-3 text-ink-muted whitespace-nowrap">{fmt(u.createdAt)}</td>
                    <td className="py-3 pe-6 md:pe-0 text-end">
                      {isSelf ? (
                        <span className="text-[11px] uppercase tracking-wider-1 text-ink-muted">
                          {t('admin.users.yourself')}
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setRole.mutate({ id: u._id, role: isAdmin ? 'user' : 'admin' })
                          }
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink/40 transition-colors"
                        >
                          {isAdmin ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                          {isAdmin ? t('admin.users.remove_admin') : t('admin.users.make_admin')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
