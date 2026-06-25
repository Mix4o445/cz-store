import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useRTL() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return { isRTL: false, dir: 'ltr', lang: i18n.language };
}
