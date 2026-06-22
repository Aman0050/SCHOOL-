import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// These would normally be split into separate JSON files in a production app
// (/public/locales/en/translation.json) but are hardcoded here for speed.
const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "academics": "Academics",
      "fees": "Fee Management",
      "communication": "Communication",
      "welcome": "Welcome back",
      "settings": "Settings"
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "academics": "शिक्षाविदों",
      "fees": "शुल्क प्रबंधन",
      "communication": "संचार",
      "welcome": "वापसी पर स्वागत है",
      "settings": "सेटिंग्स"
    }
  },
  ar: {
    translation: {
      "dashboard": "لوحة القيادة",
      "academics": "الأكاديميين",
      "fees": "إدارة الرسوم",
      "communication": "التواصل",
      "welcome": "مرحباً بعودتك",
      "settings": "إعدادات"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

// Handle RTL direction switching
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = i18n.dir(lng);
  if (i18n.dir(lng) === 'rtl') {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
});

export default i18n;
