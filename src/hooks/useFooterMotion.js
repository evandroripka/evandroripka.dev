import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useFooterMotion(footerRef, gridRef) {
  useLayoutEffect(() => {
    const footer = footerRef.current
    const grid = gridRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!footer || !grid || prefersReducedMotion) {
      return undefined
    }

    const cleanupCallbacks = []

    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          grid,
          {
            y: 84,
            scale: 0.975,
            opacity: 0,
          },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.05,
            ease: 'bounce.out',
          },
        )
      },
    })

    footer.querySelectorAll('.pp-footer-link').forEach((link) => {
      const icon = link.querySelector('.pp-footer-icon')

      if (!icon) {
        return
      }

      const handleEnter = () => {
        gsap.fromTo(
          icon,
          {
            y: 0,
            rotate: 0,
            scale: 1,
          },
          {
            y: -5,
            rotate: 8,
            scale: 1.12,
            duration: 0.46,
            ease: 'back.out(3)',
          },
        )
      }

      const handleLeave = () => {
        gsap.to(icon, {
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 0.36,
          ease: 'elastic.out(1, 0.45)',
        })
      }

      link.addEventListener('mouseenter', handleEnter)
      link.addEventListener('mouseleave', handleLeave)

      cleanupCallbacks.push(() => {
        link.removeEventListener('mouseenter', handleEnter)
        link.removeEventListener('mouseleave', handleLeave)
        gsap.killTweensOf(icon)
      })
    })

    return () => {
      trigger.kill()
      cleanupCallbacks.forEach((callback) => callback())
      gsap.killTweensOf(grid)
    }
  }, [footerRef, gridRef])
}
