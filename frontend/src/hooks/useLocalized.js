import { useTranslation } from 'react-i18next';

/** Returns a function that picks the localized field from { fr } objects. */
export function useLocalized() {
  const { i18n } = useTranslation();
  return (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[i18n.language] ?? value.fr ?? '';
  };
}
