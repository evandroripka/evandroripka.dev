import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useReveal(ref, options = {}) {
  useLayoutEffect(() => {
    if (!ref.current) return

    const {
      y = 60,
      duration = 1,
      start = 'top 85%',
      ease = 'power3.out',
    } = options

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          autoAlpha: 0,
          y,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start,
            once: true,
          },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [ref, options])
}