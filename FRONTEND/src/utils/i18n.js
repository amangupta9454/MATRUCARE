import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "nav_home": "Home",
            "nav_about": "About",
            "nav_contact": "Contact",
            "nav_login": "Login",
            "nav_register": "Register",
            "nav_dashboard": "Dashboard",
            "welcome": "Welcome to MaaCare",
            "slogan": "AI Powered Maternal Healthcare Platform",
            "contact_us": "Contact Us",
            "forgot_password": "Forgot Password?",
            "register_now": "Register Now",
            "submit": "Submit"
        }
    },
    hi: {
        translation: {
            "nav_home": "होम",
            "nav_about": "हमारे बारे में",
            "nav_contact": "संपर्क करें",
            "nav_login": "लॉग इन",
            "nav_register": "रजिस्टर करें",
            "nav_dashboard": "डैशबोर्ड",
            "welcome": "मातृकेयर में आपका स्वागत है",
            "slogan": "एआई संचालित मातृ स्वास्थ्य सेवा मंच",
            "contact_us": "संपर्क करें",
            "forgot_password": "क्या आप पासवर्ड भूल गए?",
            "register_now": "अभी रजिस्टर करें",
            "submit": "सबमिट करें"
        }
    },
    mr: {
        translation: {
            "nav_home": "मुख्यपृष्ठ",
            "nav_about": "आमच्याबद्दल",
            "nav_contact": "संपर्क",
            "nav_login": "लॉगिन",
            "nav_register": "नोंदणी करा",
            "nav_dashboard": "डॅशबोर्ड",
            "welcome": "MaaCare मध्ये आपले स्वागत आहे",
            "slogan": "एआय समर्थित मातृ आरोग्यसेवा व्यासपीठ",
            "contact_us": "आमच्याशी संपर्क साधा",
            "forgot_password": "पासवर्ड विसरलात?",
            "register_now": "आता नोंदणी करा",
            "submit": "सबमिट करा"
        }
    },
    bn: {
        translation: {
            "nav_home": "হোম",
            "nav_about": "আমাদের সম্পর্কে",
            "nav_contact": "যোগাযোগ",
            "nav_login": "লগইন",
            "nav_register": "নিবন্ধন করুন",
            "nav_dashboard": "ড্যাশবোর্ড",
            "welcome": "MaaCare এ স্বাগতম",
            "slogan": "এআই চালিত মাতৃ স্বাস্থ্যসেবা প্ল্যাটফর্ম",
            "contact_us": "যোগাযোগ করুন",
            "forgot_password": "পাসওয়ার্ড ভুলে গেছেন?",
            "register_now": "এখনই নিবন্ধন করুন",
            "submit": "জমা দিন"
        }
    },
    bho: {
        translation: {
            "nav_home": "घर",
            "nav_about": "हमार बारे में",
            "nav_contact": "संपर्क करीं",
            "nav_login": "लॉगइन",
            "nav_register": "रजिस्टर",
            "nav_dashboard": "डैशबोर्ड",
            "welcome": "MaaCare में राउर स्वागत बा",
            "slogan": "एआई संचालित मातृ स्वास्थ्य सेवा मंच",
            "contact_us": "संपर्क करीं",
            "forgot_password": "पासवर्ड भुला गइल बा?",
            "register_now": "अबहीं रजिस्टर करीं",
            "submit": "जमा करीं"
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
            escapeValue: false, // not needed for react as it escapes by default
        }
    });

export default i18n;
