import { useEffect } from 'react'

type KeyCombo = {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

export function useKeyboardShortcut(combo: KeyCombo, handler: () => void) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (combo.meta && !e.metaKey) return
      if (combo.ctrl && !e.ctrlKey) return
      if (combo.shift && !e.shiftKey) return
      if (combo.alt && !e.altKey) return
      if (e.key.toLowerCase() !== combo.key.toLowerCase()) return

      e.preventDefault()
      handler()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo.key, combo.meta, combo.ctrl, combo.shift, combo.alt, handler])
}
