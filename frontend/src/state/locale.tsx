import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { arabic } from '../lib/translations'

export type Locale = 'en-GB' | 'ar-EG'
export let activeLocale: Locale = 'en-GB'
export function t(text: string, values?: Record<string, string | number>): string {
  const key = text.trim()
  const translated = activeLocale === 'ar-EG' && arabic[key] ? text.replace(key, arabic[key]) : text
  return values ? translated.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`)) : translated
}
const Context = createContext<{locale: Locale; setLocale: (locale: Locale) => void}>({locale:'en-GB',setLocale:()=>{}})
export function LocaleProvider({children}: {children: ReactNode}) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {return localStorage.getItem('gadded.locale') === 'ar-EG' ? 'ar-EG' : 'en-GB'} catch {return 'en-GB'}
  })
  activeLocale = locale
  useEffect(() => {
    document.documentElement.lang = locale; document.documentElement.dir = locale === 'ar-EG' ? 'rtl' : 'ltr'
    try {localStorage.setItem('gadded.locale',locale)} catch { /* Preference is optional. */ }
  },[locale])
  return <Context.Provider value={{locale,setLocale}}>{children}</Context.Provider>
}
export const useLocale = () => useContext(Context)
