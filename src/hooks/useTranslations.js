'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/lib/i18n';
import enTranslations from '@/locales/en.json';

export function useTranslations() {
  const params = useParams();
  const [currentLocale, setCurrentLocale] = useState('en');
  const [t, setT] = useState(enTranslations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        const locale = params?.lang || 'en';
        setCurrentLocale(locale);
        setIsLoading(true);

        if (locale === 'en') {
          setT(enTranslations);
          setIsLoading(false);
          return;
        }

        const translations = await getTranslation(locale);
        if (translations) {
          setT(translations);
        } else {
          setT(enTranslations);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        setT(enTranslations);
      } finally {
        setIsLoading(false);
      }
    }
    loadTranslations();
  }, [params?.lang]);

  return { t, currentLocale, isLoading };
}
