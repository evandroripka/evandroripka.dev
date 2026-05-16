import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function usePinnedProjects(sectionRef, stickyRef) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!section || !sticky || prefersReducedMotion) {
      return undefined
    }

    const media = gsap.matchMedia()

    media.add('(min-width: 961px)', () => {
      section.classList.add('pp-projects--js-pin')

      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(section.scrollHeight - window.innerHeight, window.innerHeight)}`,
        pin: sticky,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })

      window.addEventListener('load', ScrollTrigger.refresh)

      return () => {
        window.removeEventListener('load', ScrollTrigger.refresh)
        section.classList.remove('pp-projects--js-pin')
        pinTrigger.kill()
      }
    })

    return () => media.revert()
  }, [sectionRef, stickyRef])
}
