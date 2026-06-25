import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import SectionHeader from './SectionHeader';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
        checked ? 'bg-ink' : 'bg-line'
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 transform rounded-full bg-paper transition-transform shadow-sm',
          checked ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function Row({ title, sub, children }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 items-center py-5 border-b border-line last:border-b-0">
      <div className="min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {sub && <p className="text-ink-muted text-xs mt-1 leading-relaxed">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AccountPreferences() {
  const { t } = useTranslation();
  const [emails, setEmails] = useState(true);
  const [currency, setCurrency] = useState('MAD');

  return (
    <div>
      <SectionHeader title={t('account.preferences.title')} sub={t('account.preferences.sub')} />

      <div className="max-w-2xl border-y border-line">
        <Row title={t('account.preferences.language')} sub={t('account.preferences.language_sub')}>
          <div className="inline-flex items-center border border-line rounded-full p-0.5 text-xs font-semibold uppercase tracking-wider-1">
            <span className="px-3 py-1.5 rounded-full bg-ink text-paper">FR</span>
          </div>
        </Row>

        <Row
          title={t('account.preferences.notifications')}
          sub={t('account.preferences.notifications_sub')}
        >
          <Toggle
            checked={emails}
            onChange={setEmails}
            label={t('account.preferences.notifications')}
          />
        </Row>

        <Row title={t('account.preferences.currency')} sub={t('account.preferences.currency_sub')}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent border-b border-ink/20 px-0 py-1.5 text-sm focus:border-ink outline-none"
          >
            <option value="MAD">MAD — Dirham</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dollar</option>
          </select>
        </Row>
      </div>

      <p className="text-[11px] uppercase tracking-wider-2 text-ink-muted mt-4">
        Les préférences seront synchronisées avec votre compte prochainement.
      </p>
    </div>
  );
}
