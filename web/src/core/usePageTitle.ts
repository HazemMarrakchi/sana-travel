import { useEffect } from 'react'

/** met à jour document.title — suffixe marque constant */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · SANA Travel` : 'SANA Travel'
  }, [title])
}
