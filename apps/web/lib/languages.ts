export interface Language {
  code: string
  translationKey: string
  nativeName: string
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'uz', translationKey: 'common.uzbek', nativeName: "O'zbek" },
  { code: 'en', translationKey: 'common.english', nativeName: 'English' },
  { code: 'ru', translationKey: 'common.russian', nativeName: 'Русский' },
]

export const getLanguageByCode = (code: string): Language | undefined => {
  return AVAILABLE_LANGUAGES.find(lang => lang.code === code)
}

export const getCurrentLanguageNativeName = (currentLang: string): string => {
  const language = getLanguageByCode(currentLang)
  return language?.nativeName || "O'zbek"
}
