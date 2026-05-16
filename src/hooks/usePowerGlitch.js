import { useLayoutEffect } from 'react'
import { PowerGlitch } from 'powerglitch'

const glitchOptions = {
  playMode: 'hover',
  hideOverflow: true,
  timing: {
    duration: 320,
    iterations: 1,
  },
  glitchTimeSpan: {
    start: 0,
    end: 0.9,
  },
  shake: {
    velocity: 12,
    amplitudeX: 0.08,
    amplitudeY: 0.025,
  },
  slice: {
    count: 4,
    velocity: 12,
    minHeight: 0.02,
    maxHeight: 0.14,
    hueRotate: false,
    cssFilters: 'drop-shadow(1px 0 #4cc9f0) drop-shadow(-1px 0 #f72585) saturate(1.25)',
  },
  pulse: false,
}

export function usePowerGlitch(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!root || prefersReducedMotion) {
      return undefined
    }

    const targets = Array.from(root.querySelectorAll('.pp-glitch-hover'))

    if (!targets.length) {
      return undefined
    }

    const glitch = PowerGlitch.glitch(targets, glitchOptions)

    glitch.containers.forEach((container) => {
      container.classList.add('pp-glitch-container')
    })

    return () => {
      glitch.stopGlitch()
    }
  }, [rootRef])
}
