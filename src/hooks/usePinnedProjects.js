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

      const cards = Array.from(section.querySelectorAll('.pp-project-card'))
      const snapStep = cards.length > 1 ? 1 / (cards.length - 1) : 1
      let snapTimer = 0
      let isWheelSnapping = false
      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(section.scrollHeight - window.innerHeight, window.innerHeight)}`,
        pin: sticky,
        pinSpacing: false,
        snap: cards.length > 1
          ? {
              snapTo: snapStep,
              duration: { min: 0.35, max: 0.65 },
              delay: 0.04,
              ease: 'power3.inOut',
            }
          : false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      })

      function projectPositions() {
        return cards.map((card) => card.getBoundingClientRect().top + window.scrollY)
      }

      function closestProjectIndex(positions, currentY) {
        return positions.reduce((closest, position, index) => {
          const closestDistance = Math.abs(positions[closest] - currentY)
          const nextDistance = Math.abs(position - currentY)

          return nextDistance < closestDistance ? index : closest
        }, 0)
      }

      function handleProjectWheel(event) {
        if (event.ctrlKey || cards.length < 2 || Math.abs(event.deltaY) < 8 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
          return
        }

        const rect = section.getBoundingClientRect()
        const isActive = rect.top <= 2 && rect.bottom >= window.innerHeight - 2

        if (!isActive || isWheelSnapping) {
          return
        }

        const direction = event.deltaY > 0 ? 1 : -1
        const positions = projectPositions()
        const currentY = window.scrollY
        const currentIndex = closestProjectIndex(positions, currentY)
        const isLeavingBefore = direction < 0 && currentIndex === 0 && currentY <= positions[0] + 4
        const isLeavingAfter = direction > 0 && currentIndex === positions.length - 1 && currentY >= positions[currentIndex] - 4

        if (isLeavingBefore || isLeavingAfter) {
          return
        }

        event.preventDefault()

        const nextIndex = Math.min(Math.max(currentIndex + direction, 0), positions.length - 1)
        isWheelSnapping = true
        window.scrollTo({
          top: positions[nextIndex],
          behavior: 'smooth',
        })

        window.clearTimeout(snapTimer)
        snapTimer = window.setTimeout(() => {
          isWheelSnapping = false
        }, 760)
      }

      section.addEventListener('wheel', handleProjectWheel, { passive: false })
      window.addEventListener('load', ScrollTrigger.refresh)

      return () => {
        window.clearTimeout(snapTimer)
        section.removeEventListener('wheel', handleProjectWheel)
        window.removeEventListener('load', ScrollTrigger.refresh)
        section.classList.remove('pp-projects--js-pin')
        pinTrigger.kill()
      }
    })

    return () => media.revert()
  }, [sectionRef, stickyRef])
}
