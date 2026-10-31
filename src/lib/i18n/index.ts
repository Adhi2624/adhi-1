import en from "./en";
import type { I18nKeys } from "./en";

const locales: Record<string, I18nKeys> = { en };

let currentLocale = "en";

export function setLocale(locale: string) {
  if (locales[locale]) {
    currentLocale = locale;
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function t(): I18nKeys {
  return locales[currentLocale] || en;
}

export { en };
export type { I18nKeys };
