import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en", // Default language
    supportedLngs: ["en", "ar"],
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json"),
    },
    detection: {
      order: ["header", "querystring", "cookie"], // Detect language from header, query param, or cookies
      caches: ["cookie"],
    },
    interpolation: { escapeValue: false },
  });

export default middleware.handle(i18next);
