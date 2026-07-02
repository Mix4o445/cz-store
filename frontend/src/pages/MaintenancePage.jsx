import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMaintenance } from '@/hooks/useSettings';
import Logo from '@/components/common/Logo';

export default function MaintenancePage() {
  const { t } = useTranslation();
  const { data, refetch, isFetching, isError } = useMaintenance();
  const message = data?.maintenanceMessage || t('maintenance.default_message');

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="container-app py-6 flex items-center justify-between">
        <Logo className="h-9 md:h-10" />
      </header>

      <main className="flex-1 grid place-items-center px-5">
        <div className="max-w-xl text-center space-y-8">
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
