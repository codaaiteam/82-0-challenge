'use client'

import { useEffect } from 'react'

// Static-export replacement for the old src/middleware.ts (middleware is not
// supported with output:'export'). On a prefix-less (English) path, send
// visitors whose browser asks for another supported language to /<lang>.
// Pages that already carry a locale prefix are left untouched, and the jump is
// one-shot per session so a visitor who navigates back to English stays there.
const LOCALES = ['zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt']
const PREFIX_RE = /^\/(en|zh|ja|ko|es|fr|de|pt)(\/|$)/

export default function LocaleRedirect() {
  useEffect(() => {
    try {
      const path = window.location.pathname
      if (PREFIX_RE.test(path)) return
      if (sessionStorage.getItem('lr')) return
      sessionStorage.setItem('lr', '1')
      const lang = (navigator.language || 'en').split('-')[0]
      if (LOCALES.includes(lang)) {
        window.location.replace('/' + lang + (path === '/' ? '' : path))
      }
    } catch {
      /* no-op */
    }
  }, [])
  return null
}
