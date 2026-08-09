'use client'

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';

const LOCALE_LOADERS: Record<string, () => Promise<{ default: any }>> = {
  uz: () => import('../locales/uz.json'),
  ru: () => import('../locales/ru.json'),
};

// Only bundle English; lazy-load all other locales on demand
const resources = {
  en: { common: en },
};

async function loadLocale(lng: string) {
  const code = lng.split('-')[0]
  if (code === 'en' || !LOCALE_LOADERS[code]) return;
  if (i18n.hasResourceBundle(code, 'common')) return;

  try {
    const mod = await LOCALE_LOADERS[code]();
    i18n.addResourceBundle(code, 'common', mod.default, true, true);
  } catch (e) {
    console.warn(`Failed to load locale: ${lng}`, e)
  }
}

// Determine initial language: prefer localStorage, then fall back to 'uz'
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('i18nextLng')
    if (stored && ['uz', 'en', 'ru'].includes(stored.split('-')[0])) {
      return stored.split('-')[0]
    }
    // Default to Uzbek for all new visitors
    localStorage.setItem('i18nextLng', 'uz')
  }
  return 'uz'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'uz',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
    },
    react: {
      useSuspense: false,
    }
  });

// Load the detected language if it's not English — export the promise
// so I18nProvider can wait for resources before rendering
export const initialLocaleReady = loadLocale(i18n.language.split('-')[0]);

/**
 * Switch language safely — preloads the bundle before switching
 * so the UI never flashes English as a fallback.
 */
export async function changeLanguage(lng: string) {
  await loadLocale(lng)
  localStorage.setItem('i18nextLng', lng)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('i18nextLng_userPicked', '1')
    } catch (e) {}
  }
  return i18n.changeLanguage(lng)
}

export default i18n;
