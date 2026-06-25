import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function LanguageSwitcher({ className = '', tone = 'light' }) {
  const { i18n } = useTranslation();
  const activeCls = tone === 'dark' ? 'text-paper' : 'text-ink';

  return (
    <div
      className={clsx('inline-flex items-center text-[11px] font-semibold uppercase tracking-wider-1', className)}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage('fr')}
        className={clsx('px-1.5 py-1 transition-colors', activeCls)}
      >
        FR
      </button>
    </div>
  );
}
