import { useCallback, useRef } from 'react'

export function useProjectCursor() {
  const cursorRef = useRef(null)

  const moveCursor = useCallback((event) => {
    if (!cursorRef.current) {
      return
    }

    cursorRef.current.style.left = `${event.clientX}px`
    cursorRef.current.style.top = `${event.clientY}px`
  }, [])

  const showCursor = useCallback(() => {
    cursorRef.current?.classList.add('is-active')
  }, [])

  const hideCursor = useCallback(() => {
    cursorRef.current?.classList.remove('is-active')
  }, [])

  return {
    cursorRef,
    moveCursor,
    showCursor,
    hideCursor,
  }
}
