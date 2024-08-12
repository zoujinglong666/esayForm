import {LocaleType} from "@/type/config";

export const setHtmlPageLang = (locale: LocaleType) => {
  document.querySelector('html')?.setAttribute('lang', locale)
}
