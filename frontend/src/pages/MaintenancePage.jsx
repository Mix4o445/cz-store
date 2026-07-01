import { Construction, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMaintenance } from '@/hooks/useSettings';

export default function MaintenancePage() {
  const { t } = useTranslation();
  const { data, refetch, isFetching, isError } = useMaintenance();
  const message = data?.maintenanceMessage || t('maintenance.default_message');

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="container-app py-6 flex items-center justify-between">
        <span className="font-display text-lg font-medium tracking-tight">
          CoolZone
        </span>
        <a
          href="/admin"
          className="text-[11px] uppercase tracking-wider-1 text-ink-muted hover:text-ink"
        >
          {t('maintenance.admin_link')}
        </a>
      </header>

      <main className="flex-1 grid place-items-center px-5">
        <div className="max-w-xl text-center space-y-8">
          <div className="grid place-items-center">
            <div className="relative">
              <span className="absolute inset-0 grid place-items-center">
                <span className="block w-24 h-24 rounded-full bg-ink/5 animate-ping" />
              </span>
              <span className="relative grid place-items-center w-20 h-20 rounded-full bg-ink text-paper">
                <Construction size={28} strokeWidth={1.4} />
              </span>
            </div>
          </div>

          <p className="eyebrow justify-center">{t('maintenance.eyebrow')}</p>
          <h1 className="font-display font-medium text-display-sm md:text-display-md">
            {t('maintenance.title')}
          </h1>
          <p className="text-base md:text-lg text-ink-muted leading-relaxed max-w-md mx-auto">
            {message}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-outline inline-flex items-center gap-2"
          >
            <RefreshCw
              size={14}
              className={isFetching ? 'animate-spin' : ''}
              strokeWidth={1.6}
            />
            {t('maintenance.retry')}
          </button>

          {isError && (
            <p className="text-xs text-ink-muted/70">
              {t('maintenance.offline_hint')}
            </p>
          )}
        </div>
      </main>

      <footer className="container-app py-6 text-center text-[11px] text-ink-muted uppercase tracking-wider-1">
        © {new Date().getFullYear()} CoolZone
      </footer>
    </div>
  );
}
