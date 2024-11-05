import { Pathnames, LocalePrefix } from "next-intl/routing";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const siteConfig = {
  name: "Imagify",
  url: getBaseUrl(),
  domain: "imagify.ru",
  mail: "support@imagify.ru",
  effectiveDate: "2024.11.11"
} as const;

export const defaultLocale = "ru" as const;
export const languages = [
  { lang: "en", label: "English", hrefLang: "en-US" },
  { lang: "ru", label: "Русский", hrefLang: "ru-RU" },
] as const;

export const locales = languages.map((lang) => lang.lang);

export const localePrefix: LocalePrefix<typeof locales> = "as-needed";
