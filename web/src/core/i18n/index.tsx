import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Dict, Lang } from './types'
import { fr } from './fr'
import { en } from './en'
import { ar } from './ar'

const LS_KEY = 'sana-lang'

const DICTS: Record<Lang, Dict> = { fr, en, ar }

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'عربي' },
]

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: string) => string
}

const Ctx = createContext<LangCtx>({ lang: 'fr', setLang: () => {}, t: (k) => k })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(LS_KEY) as Lang | null
    return saved && DICTS[saved] ? saved : 'fr'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem(LS_KEY, lang)
  }, [lang])

  const t = (k: string): string => DICTS[lang][k] ?? fr[k] ?? k

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useT() {
  return useContext(Ctx)
}

export type { Lang }
