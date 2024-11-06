import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "./config/site";

// Создаем middleware для интернационализации
export default createMiddleware({
  // Список локалей
  locales,
  // Локаль по умолчанию
  defaultLocale,
  // Префикс локали
  localePrefix,
  // Включаем автоматическое определение локали
  localeDetection: true
});

export const config = {
  // Защищаем все роуты кроме API и статических файлов
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
