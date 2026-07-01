import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Construction, Loader2, Save, Power } from 'lucide-react';
import clsx from 'clsx';
import { useMaintenance, useSetMaintenance } from '@/hooks/useSettings';
import { getApiErrorMessage } from '@/hooks/useAuth';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { data, isLoading } = useMaintenance();
  const update = useSetMaintenance();

  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setEnabled(!!data.maintenanceMode);
      setMessage(data.maintenanceMessage || '');
    }
  }, [data]);

  const onSave = (e) => {
    e.preventDefault();
    setSaved(false);
    update.mutate(
      { maintenanceMode: enabled, maintenanceMessage: message },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid place-items-center py-16 text-ink-muted">
        <Loader2 size={26} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <p className="eyebrow mb-3">{t('admin.settings.eyebrow')}</p>
        <h2 className="font-display text-display-sm font-medium">
          {t('admin.settings.title')}
        </h2>
        <p className="text-ink-muted text-sm mt-2">
          {t('admin.settings.sub')}
        </p>
      </header>

      <form onSubmit={onSave} className="space-y-6">
        <section
          className={clsx(
            'border p-5 md:p-6 rounded-2xl transition-colors',
            enabled
              ? 'border-ink bg-ink text-paper'
              : 'border-line bg-paper'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                'grid place-items-center w-11 h-11 rounded-full shrink-0',
                enabled ? 'bg-paper text-ink' : 'bg-ink/5 text-ink'
              )}
            >
              <Power size={18} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3
                    className={clsx(
                      'font-medium text-base',
                      enabled ? 'text-paper' : 'text-ink'
                    )}
                  >
                    {t('admin.settings.mode_title')}
                  </h3>
                  <p
                    className={clsx(
                      'text-sm mt-1',
                      enabled ? 'text-paper/70' : 'text-ink-muted'
                    )}
                  >
                    {enabled
                      ? t('admin.settings.mode_on_hint')
                      : t('admin.settings.mode_off_hint')}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => setEnabled((v) => !v)}
                  className={clsx(
                    'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
                    enabled ? 'bg-primary' : 'bg-line'
                  )}
                >
                  <span
                    className={clsx(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-paper shadow transition-transform mt-0.5',
                      enabled ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <label className="block">
            <span className="text-[11px] uppercase tracking-wider-2 text-ink-muted">
              {t('admin.settings.message_label')}
            </span>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              placeholder={t('admin.settings.message_placeholder')}
              className="mt-2 w-full bg-transparent border-b border-ink/20 px-0 py-2.5 outline-none focus:border-ink resize-none"
            />
            <span className="block mt-1 text-[11px] text-ink-muted text-end">
              {message.length}/500
            </span>
          </label>
        </section>

        {update.isError && (
          <p className="text-sm text-signal border-s-2 border-signal ps-3">
            {getApiErrorMessage(update.error)}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-line">
          <button
            type="submit"
            disabled={update.isPending}
            className="btn-primary inline-flex items-center gap-2"
          >
            {update.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} strokeWidth={1.6} />
            )}
            {t('admin.settings.save')}
          </button>
          {saved && (
            <span className="text-sm text-emerald-700 inline-flex items-center gap-1.5">
              <Construction size={13} strokeWidth={1.8} />
              {t('admin.settings.saved')}
            </span>
          )}
        </div>
      </form>

      <aside className="border border-line p-5 rounded-2xl bg-chrome/50 text-sm space-y-2">
        <p className="font-medium text-ink">{t('admin.settings.how_title')}</p>
        <ul className="list-disc ps-5 text-ink-muted space-y-1">
          <li>{t('admin.settings.how_1')}</li>
          <li>{t('admin.settings.how_2')}</li>
          <li>{t('admin.settings.how_3')}</li>
        </ul>
      </aside>
    </div>
  );
}
