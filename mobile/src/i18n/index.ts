import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';

const STORE_LANGUAGE_KEY = 'settings.lang';

const languageDetectorPlugin = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async function (callback: (lang: string) => void) {
    try {
      // Get saved language from AsyncStorage
      await AsyncStorage.getItem(STORE_LANGUAGE_KEY).then((language) => {
        if (language) {
          return callback(language);
        } else {
          // If no language is saved, use device's language
          let deviceLang = Localization.getLocales()[0]?.languageCode || 'en';
          return callback(deviceLang);
        }
      });
    } catch (error) {
      console.log('Error reading language', error);
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      // Save language to AsyncStorage
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (error) {}
  },
};

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n
  .use(initReactI18next)
  // .use(languageDetectorPlugin) // Can add this later if expo-localization is installed
  .init({
    resources,
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    lng: 'fr', // Force French by default as requested
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
