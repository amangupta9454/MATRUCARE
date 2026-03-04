/**
 * translator.js
 * Utilizes google-translate-api-x to translate chat messages between supported languages.
 */

const { translate } = require('google-translate-api-x');

// Supported languages in MaaCare based on VoiceNavigator
const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'bn', 'bho'];

/**
 * Translates text into all provided target languages.
 * @param {string} text - The original text.
 * @param {Array<string>} targetLangs - Array of 2-letter lang codes.
 * @returns {Promise<Object>} Map of lang code -> translated string.
 */
const translateMessage = async (text, targetLangs) => {
    const translations = {};
    for (const lang of targetLangs) {
        if (!SUPPORTED_LANGUAGES.includes(lang) || lang === 'en') {
            translations[lang] = text; // Fallback to original
            continue;
        }
        try {
            const res = await translate(text, { to: lang });
            translations[lang] = res.text;
        } catch (error) {
            console.error(`Translation error for ${lang}:`, error);
            translations[lang] = text; // Fallback on error
        }
    }
    return translations;
};

module.exports = { translateMessage, SUPPORTED_LANGUAGES };
