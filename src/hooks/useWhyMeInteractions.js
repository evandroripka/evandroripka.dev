import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const desktopQuery = '(min-width: 1024px)'

const videoDefaults = {
  type: 'video/mp4',
  opacity: 0.42,
  overlayOpacity: 1,
  overlay:
    'linear-gradient(90deg, var(--bg-main) 0%, rgba(11, 15, 26, 0.86) 30%, rgba(11, 15, 26, 0.42) 62%, rgba(11, 15, 26, 0.08) 100%)',
}

const particlesConfig = {
  duration: 0.58,
  returnDuration: 0.56,
  sampleStep: 6,
  maxParticles: 250,
  alphaThreshold: 24,
  ignoreLightPixels: true,
  lightPixelThreshold: 244,
  colors: ['#4cc9f0', '#4ce5f0', '#4cddf0', '#4cf0f0', '#b9f7ff'],
  useImageColors: false,
  particleSize: {
    min: 0.6,
    max: 1,
  },
  glowScale: {
    min: 1.5,
    max: 2.1,
  },
  tailScale: {
    min: 0.2,
    max: 0.5,
  },
  targetSpread: {
    x: 122,
    y: 78,
  },
  targetPadding: 22,
  targetEdgeBias: 0.74,
  transitionPeakAlpha: 0.94,
  disappearStart: 0.52,
  returnDisappearStart: 0.86,
  cometStretch: 1.9,
  sourceJitter: 8,
  flightWarp: {
    x: 90,
    y: 150,
  },
  ease: 'sine.inOut',
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function mix(start, end, progress) {
  return start + (end - start) * progress
}

function quadraticBezier(start, control, end, progress) {
  const inverse = 1 - progress

  return inverse * inverse * start + 2 * inverse * progress * control + progress * progress * end
}

function toHexNumber(color) {
  return Number.parseInt(color.replace('#', ''), 16)
}

function setAdditiveBlend(displayObject) {
  displayObject.blendMode = 'add'
}

function createVideoLookup(cards) {
  return new Map(cards.map((card) => [card.id, { ...videoDefaults, ...card.video }]))
}

function createRadialTexture(PIXI, size, coreStop = 0.18) {
  const ratio = 2
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const radius = size / 2

  canvas.width = size * ratio
  canvas.height = size * ratio
  context.scale(ratio, ratio)

  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius)

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(coreStop, 'rgba(255, 255, 255, 0.95)')
  gradient.addColorStop(0.62, 'rgba(255, 255, 255, 0.22)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  return PIXI.Texture.from(canvas)
}

function createTailTexture(PIXI) {
  const width = 160
  const height = 34
  const ratio = 2
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = width * ratio
  canvas.height = height * ratio
  context.scale(ratio, ratio)

  const gradient = context.createLinearGradient(0, 0, width, 0)

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.18)')
  gradient.addColorStop(0.72, 'rgba(255, 255, 255, 0.7)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  context.fillStyle = gradient
  context.beginPath()
  context.ellipse(width / 2, height / 2, width / 2, height / 2.8, 0, 0, Math.PI * 2)
  context.fill()

  return PIXI.Texture.from(canvas)
}

function preloadFrames(frames) {
  frames.forEach((src, index) => {
    if (index === 0) {
      return
    }

    const image = new Image()

    image.decoding = 'async'
    image.src = src
  })
}

export function useWhyMeInteractions({ sectionRef, videoLayerRef, videoRef, chairRef, cards, chairFrames, isDesktop }) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    const layer = videoLayerRef.current
    const video = videoRef.current
    const chair = chairRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!section || !layer || !video || !cards.length || prefersReducedMotion) {
      return undefined
    }

    const media = gsap.matchMedia()

    media.add('(max-width: 1023px)', () => {
      const cardElements = Array.from(section.querySelectorAll('[data-why-video-target]'))
      const source = video.querySelector('source')
      const cleanupCallbacks = []
      const videoConfigs = createVideoLookup(cards)
      const state = {
        activeTarget: null,
        hideTimer: null,
      }

      if (!cardElements.length || !source) {
        return undefined
      }

      function showVideo(target) {
        const videoConfig = videoConfigs.get(target)

        window.clearTimeout(state.hideTimer)

        if (!videoConfig) {
          hideVideo()
          return
        }

        layer.style.setProperty('--why-video-opacity', Math.min(videoConfig.opacity + 0.08, 0.58))
        layer.style.setProperty(
          '--why-video-overlay',
          'linear-gradient(180deg, rgba(11, 15, 26, 0.68) 0%, rgba(11, 15, 26, 0.88) 52%, var(--bg-main) 100%)',
        )
        layer.style.setProperty('--why-video-overlay-opacity', videoConfig.overlayOpacity)

        if (source.getAttribute('src') !== videoConfig.src) {
          source.setAttribute('src', videoConfig.src)
          source.setAttribute('type', videoConfig.type)
          video.load()
        }

        video.play().catch(() => {})
        state.activeTarget = target

        gsap.killTweensOf(layer)
        gsap.fromTo(
          layer,
          {
            autoAlpha: 0,
            yPercent: 4,
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.42,
            ease: 'power3.out',
            overwrite: true,
          },
        )
      }

      function hideVideo() {
        state.activeTarget = null
        gsap.killTweensOf(layer)
        gsap.to(layer, {
          autoAlpha: 0,
          yPercent: 4,
          duration: 0.34,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            if (!state.activeTarget) {
              video.pause()
            }
          },
        })
      }

      function scheduleVideoHide(delay = 120) {
        window.clearTimeout(state.hideTimer)
        state.hideTimer = window.setTimeout(() => {
          const stillActive = cardElements.some((card) => card.matches(':hover') || card === document.activeElement)

          if (!stillActive) {
            hideVideo()
          }
        }, delay)
      }

      cardElements.forEach((card) => {
        const handleMouseEnter = () => showVideo(card.dataset.whyVideoTarget)
        const handleMouseLeave = () => scheduleVideoHide()
        const handleFocus = () => showVideo(card.dataset.whyVideoTarget)
        const handleBlur = () => scheduleVideoHide()
        const handlePointerDown = (event) => {
          if (event.pointerType === 'mouse') {
            return
          }

          showVideo(card.dataset.whyVideoTarget)
          scheduleVideoHide(2600)
        }

        card.addEventListener('mouseenter', handleMouseEnter)
        card.addEventListener('mouseleave', handleMouseLeave)
        card.addEventListener('focusin', handleFocus)
        card.addEventListener('focusout', handleBlur)
        card.addEventListener('pointerdown', handlePointerDown)

        cleanupCallbacks.push(() => {
          card.removeEventListener('mouseenter', handleMouseEnter)
          card.removeEventListener('mouseleave', handleMouseLeave)
          card.removeEventListener('focusin', handleFocus)
          card.removeEventListener('focusout', handleBlur)
          card.removeEventListener('pointerdown', handlePointerDown)
        })
      })

      return () => {
        window.clearTimeout(state.hideTimer)
        cleanupCallbacks.forEach((callback) => callback())
        gsap.killTweensOf(layer)
        video.pause()
      }
    })

    media.add(desktopQuery, () => {
      if (!chair || !chairFrames.length || !isDesktop) {
        return undefined
      }

      const cardElements = Array.from(section.querySelectorAll('[data-why-video-target]'))
      const source = video.querySelector('source')
      const cleanupCallbacks = []
      const delayedCalls = []
      const videoConfigs = createVideoLookup(cards)
      const state = {
        app: null,
        initPromise: null,
        stageElement: null,
        textures: null,
        pixi: null,
        particles: [],
        activeTarget: null,
        isHovering: false,
        sequence: 0,
        leaveTimer: null,
        hideTimer: null,
        currentFrame: -1,
        frameRequest: null,
        activeFrameTrigger: null,
        pendingFrameIndex: null,
        disposed: false,
      }

      if (!cardElements.length || !source) {
        return undefined
      }

      function schedule(callback, delay) {
        const call = gsap.delayedCall(delay, callback)

        delayedCalls.push(call)
        return call
      }

      function clearDelayedCalls() {
        delayedCalls.forEach((call) => call.kill())
        delayedCalls.length = 0
      }

      function isCharacterHovering() {
        return state.isHovering
      }

      function setFrame(frameIndex, options = {}) {
        if (!options.force && isCharacterHovering()) {
          state.pendingFrameIndex = frameIndex
          return
        }

        const nextFrame = Math.min(chairFrames.length - 1, Math.max(0, Math.round(frameIndex)))

        if (nextFrame === state.currentFrame) {
          return
        }

        state.currentFrame = nextFrame

        if (state.frameRequest) {
          return
        }

        state.frameRequest = requestAnimationFrame(() => {
          chair.src = chairFrames[state.currentFrame]
          state.frameRequest = null
        })
      }

      function syncFrameToScroll() {
        const frameIndex = state.activeFrameTrigger
          ? state.activeFrameTrigger.progress * (chairFrames.length - 1)
          : state.pendingFrameIndex

        if (frameIndex === null) {
          return
        }

        state.pendingFrameIndex = null
        setFrame(frameIndex, { force: true })
      }

      function showVideo(target) {
        const videoConfig = videoConfigs.get(target)

        window.clearTimeout(state.hideTimer)

        if (!videoConfig) {
          hideVideo()
          return
        }

        layer.style.setProperty('--why-video-opacity', videoConfig.opacity)
        layer.style.setProperty('--why-video-overlay', videoConfig.overlay)
        layer.style.setProperty('--why-video-overlay-opacity', videoConfig.overlayOpacity)

        if (source.getAttribute('src') !== videoConfig.src) {
          source.setAttribute('src', videoConfig.src)
          source.setAttribute('type', videoConfig.type)
          video.load()
        }

        video.play().catch(() => {})
        state.activeTarget = target

        gsap.killTweensOf(layer)
        gsap.fromTo(
          layer,
          {
            autoAlpha: 0,
            xPercent: 10,
          },
          {
            autoAlpha: 1,
            xPercent: 0,
            duration: 0.58,
            ease: 'power3.out',
            overwrite: true,
          },
        )
      }

      function hideVideo() {
        state.activeTarget = null
        gsap.killTweensOf(layer)
        gsap.to(layer, {
          autoAlpha: 0,
          xPercent: 10,
          duration: 0.44,
          ease: 'power2.inOut',
          overwrite: true,
          onComplete: () => {
            if (!state.activeTarget) {
              video.pause()
            }
          },
        })
      }

      function scheduleVideoHide() {
        window.clearTimeout(state.hideTimer)
        state.hideTimer = window.setTimeout(() => {
          const stillHoveringVideoCard = cardElements.some((card) => card.matches(':hover'))

          if (!stillHoveringVideoCard) {
            hideVideo()
          }
        }, 80)
      }

      function createStageElement() {
        const stageElement = document.createElement('div')

        stageElement.className = 'pp-why-me-particle-stage'
        stageElement.setAttribute('aria-hidden', 'true')
        section.appendChild(stageElement)

        return stageElement
      }

      async function initPixi() {
        if (state.app) {
          return state.app
        }

        if (state.initPromise) {
          return state.initPromise
        }

        state.initPromise = (async () => {
          const PIXI = await import('pixi.js')

          if (state.disposed) {
            return null
          }

          state.stageElement = createStageElement()
          state.app = new PIXI.Application()
          state.pixi = PIXI

          await state.app.init({
            backgroundAlpha: 0,
            antialias: true,
            autoDensity: true,
            resolution: Math.min(window.devicePixelRatio || 1, 2),
            resizeTo: section,
          })

          if (state.disposed) {
            return null
          }

          state.stageElement.appendChild(state.app.canvas)
          state.textures = {
            core: createRadialTexture(PIXI, 32, 0.28),
            glow: createRadialTexture(PIXI, 72, 0.08),
            tail: createTailTexture(PIXI),
          }

          return state.app
        })()

        return state.initPromise
      }

      async function waitForImage() {
        if (chair.complete && chair.naturalWidth) {
          return
        }

        if (chair.decode) {
          await chair.decode().catch(() => {})
        }
      }

      function setHoverLock(isLocked) {
        state.isHovering = isLocked
      }

      function hideSource() {
        gsap.killTweensOf(chair)
        gsap.to(chair, {
          opacity: 0,
          duration: 0.08,
          ease: 'power1.out',
        })
      }

      function restoreSource(onComplete) {
        gsap.killTweensOf(chair)
        gsap.to(chair, {
          opacity: 1,
          duration: 0.18,
          ease: 'power2.out',
          clearProps: 'opacity',
          onComplete,
        })
      }

      function isVisiblePixel(data, index) {
        const r = data[index]
        const g = data[index + 1]
        const b = data[index + 2]
        const a = data[index + 3]
        const isLightPixel =
          r > particlesConfig.lightPixelThreshold &&
          g > particlesConfig.lightPixelThreshold &&
          b > particlesConfig.lightPixelThreshold

        return a > particlesConfig.alphaThreshold && (!particlesConfig.ignoreLightPixels || !isLightPixel)
      }

      function pickColor(pixel) {
        if (particlesConfig.useImageColors) {
          return (pixel.r << 16) + (pixel.g << 8) + pixel.b
        }

        return toHexNumber(particlesConfig.colors[Math.floor(Math.random() * particlesConfig.colors.length)])
      }

      function sampleSourcePixels() {
        const sampleCanvas = document.createElement('canvas')
        const sampleContext = sampleCanvas.getContext('2d', {
          willReadFrequently: true,
        })
        const width = chair.naturalWidth
        const height = chair.naturalHeight
        const pixels = []

        sampleCanvas.width = width
        sampleCanvas.height = height
        sampleContext.drawImage(chair, 0, 0, width, height)

        const imageData = sampleContext.getImageData(0, 0, width, height).data

        for (let y = 0; y < height; y += particlesConfig.sampleStep) {
          for (let x = 0; x < width; x += particlesConfig.sampleStep) {
            const index = (y * width + x) * 4

            if (!isVisiblePixel(imageData, index)) {
              continue
            }

            pixels.push({
              x,
              y,
              r: imageData[index],
              g: imageData[index + 1],
              b: imageData[index + 2],
            })
          }
        }

        return pixels
      }

      function limitPixels(pixels) {
        if (pixels.length <= particlesConfig.maxParticles) {
          return pixels
        }

        const limited = pixels.slice()

        for (let index = limited.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1))
          const current = limited[index]

          limited[index] = limited[randomIndex]
          limited[randomIndex] = current
        }

        return limited.slice(0, particlesConfig.maxParticles)
      }

      function getStageRect() {
        return state.stageElement.getBoundingClientRect()
      }

      function getSourcePoints(pixels) {
        const sourceRect = chair.getBoundingClientRect()
        const stageRect = getStageRect()
        const scaleX = sourceRect.width / chair.naturalWidth
        const scaleY = sourceRect.height / chair.naturalHeight
        const sourceLeft = sourceRect.left - stageRect.left
        const sourceTop = sourceRect.top - stageRect.top

        return pixels.map((pixel) => ({
          x: sourceLeft + pixel.x * scaleX + randomBetween(-particlesConfig.sourceJitter, particlesConfig.sourceJitter),
          y: sourceTop + pixel.y * scaleY + randomBetween(-particlesConfig.sourceJitter, particlesConfig.sourceJitter),
          color: pickColor(pixel),
          size: randomBetween(particlesConfig.particleSize.min, particlesConfig.particleSize.max),
          glowScale: randomBetween(particlesConfig.glowScale.min, particlesConfig.glowScale.max),
          tailScale: randomBetween(particlesConfig.tailScale.min, particlesConfig.tailScale.max),
        }))
      }

      function getTargetPoint(target) {
        const stageRect = getStageRect()
        const targetRect = target.getBoundingClientRect()
        const left = targetRect.left - stageRect.left + particlesConfig.targetPadding
        const right = targetRect.right - stageRect.left - particlesConfig.targetPadding
        const top = targetRect.top - stageRect.top + particlesConfig.targetPadding
        const bottom = targetRect.bottom - stageRect.top - particlesConfig.targetPadding
        const shouldUseEdge = Math.random() < particlesConfig.targetEdgeBias

        if (!shouldUseEdge) {
          return {
            x: randomBetween(left, right),
            y: randomBetween(top, bottom),
          }
        }

        const edge = Math.floor(Math.random() * 4)

        if (edge === 0) {
          return {
            x: randomBetween(left, right),
            y: top + randomBetween(-particlesConfig.targetSpread.y * 0.16, particlesConfig.targetSpread.y * 0.16),
          }
        }

        if (edge === 1) {
          return {
            x: right + randomBetween(-particlesConfig.targetSpread.x * 0.12, particlesConfig.targetSpread.x * 0.12),
            y: randomBetween(top, bottom),
          }
        }

        if (edge === 2) {
          return {
            x: randomBetween(left, right),
            y: bottom + randomBetween(-particlesConfig.targetSpread.y * 0.16, particlesConfig.targetSpread.y * 0.16),
          }
        }

        return {
          x: left + randomBetween(-particlesConfig.targetSpread.x * 0.12, particlesConfig.targetSpread.x * 0.12),
          y: randomBetween(top, bottom),
        }
      }

      function createParticle(point) {
        const container = new state.pixi.Container()
        const tail = new state.pixi.Sprite(state.textures.tail)
        const glow = new state.pixi.Sprite(state.textures.glow)
        const core = new state.pixi.Sprite(state.textures.core)
        const normalizedSize = point.size / 16

        container.x = point.x
        container.y = point.y
        container.alpha = 1

        tail.anchor.set(0.82, 0.5)
        tail.tint = point.color
        tail.alpha = 0.32
        tail.scale.set(normalizedSize * point.tailScale, normalizedSize * 1.45)
        setAdditiveBlend(tail)

        glow.anchor.set(0.5)
        glow.tint = point.color
        glow.alpha = 0.42
        glow.scale.set(normalizedSize * point.glowScale)
        setAdditiveBlend(glow)

        core.anchor.set(0.5)
        core.tint = point.color
        core.alpha = 0.96
        core.scale.set(normalizedSize)
        setAdditiveBlend(core)

        container.addChild(tail, glow, core)
        state.app.stage.addChild(container)

        return {
          container,
          tail,
          glow,
          core,
          sourceX: point.x,
          sourceY: point.y,
          restX: point.x,
          restY: point.y,
          glowBaseAlpha: glow.alpha,
          tailBaseAlpha: tail.alpha,
          tailBaseScaleX: tail.scale.x,
          tailBaseScaleY: tail.scale.y,
          glowBaseScale: glow.scale.x,
          coreBaseScale: core.scale.x,
          motion: {
            progress: 0,
          },
        }
      }

      function cleanupParticles() {
        state.particles.forEach((particle) => {
          gsap.killTweensOf(particle.container)
          gsap.killTweensOf(particle.tail)
          gsap.killTweensOf(particle.glow)
          gsap.killTweensOf(particle.core)
          gsap.killTweensOf(particle.motion)
          gsap.killTweensOf(particle.tail.scale)
          particle.container.destroy({
            children: true,
          })
        })

        state.particles = []

        if (state.app) {
          state.app.stage.removeChildren()
        }
      }

      function getTravelAlpha(progress, startAlpha, mode) {
        const peakAlpha = particlesConfig.transitionPeakAlpha

        if (mode === 'return') {
          if (progress < 0.18) {
            return mix(startAlpha, peakAlpha, progress / 0.18)
          }

          if (progress > particlesConfig.returnDisappearStart) {
            return mix(
              peakAlpha,
              0.08,
              (progress - particlesConfig.returnDisappearStart) / (1 - particlesConfig.returnDisappearStart),
            )
          }

          return peakAlpha
        }

        if (progress < 0.16) {
          return mix(startAlpha, peakAlpha, progress / 0.16)
        }

        if (progress > particlesConfig.disappearStart) {
          return mix(peakAlpha, 0, (progress - particlesConfig.disappearStart) / (1 - particlesConfig.disappearStart))
        }

        return peakAlpha
      }

      function animateParticle(particle, destination, duration, mode) {
        const startX = particle.container.x
        const startY = particle.container.y
        const startAlpha = particle.container.alpha
        const controlX = (startX + destination.x) / 2 + randomBetween(-particlesConfig.flightWarp.x, particlesConfig.flightWarp.x)
        const controlY = (startY + destination.y) / 2 + randomBetween(-particlesConfig.flightWarp.y, particlesConfig.flightWarp.y)
        let previousX = startX
        let previousY = startY

        gsap.killTweensOf(particle.container)
        gsap.killTweensOf(particle.motion)
        gsap.killTweensOf(particle.tail.scale)
        gsap.killTweensOf(particle.glow)
        gsap.killTweensOf(particle.core)

        particle.container.visible = true
        particle.motion.progress = 0

        gsap.to(particle.motion, {
          progress: 1,
          duration,
          ease: particlesConfig.ease,
          onUpdate: () => {
            const progress = particle.motion.progress
            const x = quadraticBezier(startX, controlX, destination.x, progress)
            const y = quadraticBezier(startY, controlY, destination.y, progress)
            const distanceX = x - previousX
            const distanceY = y - previousY
            const speed = clamp(Math.hypot(distanceX, distanceY) / 18, 0, 1)
            const pulse = Math.sin(progress * Math.PI)

            particle.container.x = x
            particle.container.y = y
            particle.container.alpha = getTravelAlpha(progress, startAlpha, mode)
            particle.tail.alpha = particle.tailBaseAlpha + pulse * 0.24
            particle.glow.alpha = particle.glowBaseAlpha + pulse * 0.44
            particle.core.alpha = 0.68 + pulse * 0.28
            particle.tail.scale.x = particle.tailBaseScaleX * (1 + pulse * particlesConfig.cometStretch + speed)
            particle.tail.scale.y = particle.tailBaseScaleY * (1 + pulse * 0.28)
            particle.glow.scale.set(particle.glowBaseScale * (1 + pulse * 0.62))
            particle.core.scale.set(particle.coreBaseScale * (1 + pulse * 0.24))

            if (Math.abs(distanceX) + Math.abs(distanceY) > 0.02) {
              particle.tail.rotation = Math.atan2(distanceY, distanceX) + Math.PI
            }

            previousX = x
            previousY = y
          },
          onComplete: () => {
            particle.container.x = destination.x
            particle.container.y = destination.y
            particle.restX = destination.x
            particle.restY = destination.y
          },
        })
      }

      function moveParticlesToTarget(target) {
        clearDelayedCalls()
        let longestDuration = 0

        state.particles.forEach((particle) => {
          const targetPoint = getTargetPoint(target)
          const duration = particlesConfig.duration * randomBetween(0.72, 1.16)

          longestDuration = Math.max(longestDuration, duration)
          animateParticle(particle, targetPoint, duration, 'out')
        })

        schedule(() => {
          if (state.activeTarget !== target) {
            return
          }

          state.particles.forEach((particle) => {
            particle.container.alpha = 0
            particle.container.visible = false
          })
        }, longestDuration + 0.02)
      }

      async function buildParticlesFromSource(sequence) {
        const app = await initPixi()

        if (!app) {
          return false
        }

        await waitForImage()

        if (sequence !== state.sequence || !state.activeTarget || state.disposed) {
          return false
        }

        const pixels = limitPixels(sampleSourcePixels())

        if (!pixels.length) {
          return false
        }

        state.particles = getSourcePoints(pixels).map(createParticle)

        return true
      }

      async function teleportCharacter(target) {
        state.sequence += 1

        const sequence = state.sequence

        state.activeTarget = target
        setHoverLock(true)
        clearDelayedCalls()
        hideSource()

        if (!state.particles.length) {
          const didBuildParticles = await buildParticlesFromSource(sequence)

          if (!didBuildParticles) {
            restoreSource(() => setHoverLock(false))
            return
          }
        }

        if (sequence !== state.sequence || state.activeTarget !== target || state.disposed) {
          return
        }

        moveParticlesToTarget(target)
      }

      function returnCharacter() {
        state.sequence += 1
        state.activeTarget = null
        clearDelayedCalls()

        if (!state.particles.length) {
          restoreSource(() => setHoverLock(false))
          return
        }

        state.particles.forEach((particle) => {
          const destination = {
            x: particle.sourceX,
            y: particle.sourceY,
          }
          const duration = particlesConfig.returnDuration * randomBetween(0.78, 1.18)

          animateParticle(particle, destination, duration, 'return')
        })

        schedule(() => {
          restoreSource()
        }, particlesConfig.returnDuration * 0.74)

        schedule(() => {
          cleanupParticles()
          setHoverLock(false)
          syncFrameToScroll()
        }, particlesConfig.returnDuration + 0.16)
      }

      function scheduleReturn() {
        window.clearTimeout(state.leaveTimer)
        state.leaveTimer = window.setTimeout(() => {
          const stillHoveringCard = cardElements.some((card) => card.matches(':hover'))

          if (!stillHoveringCard) {
            returnCharacter()
          }
        }, 60)
      }

      preloadFrames(chairFrames)
      setFrame(0)

      const frameTrigger = ScrollTrigger.create({
        trigger: chair,
        start: 'top bottom',
        endTrigger: section,
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => setFrame(self.progress * (chairFrames.length - 1)),
        onRefresh: (self) => setFrame(self.progress * (chairFrames.length - 1)),
        onLeave: () => setFrame(chairFrames.length - 1),
        onLeaveBack: () => setFrame(0),
      })

      state.activeFrameTrigger = frameTrigger
      window.addEventListener('load', ScrollTrigger.refresh)

      cardElements.forEach((card) => {
        const handleMouseEnter = () => {
          window.clearTimeout(state.leaveTimer)
          showVideo(card.dataset.whyVideoTarget)
          teleportCharacter(card)
        }
        const handleMouseLeave = () => {
          scheduleVideoHide()
          scheduleReturn()
        }

        card.addEventListener('mouseenter', handleMouseEnter)
        card.addEventListener('mouseleave', handleMouseLeave)

        cleanupCallbacks.push(() => {
          card.removeEventListener('mouseenter', handleMouseEnter)
          card.removeEventListener('mouseleave', handleMouseLeave)
        })
      })

      return () => {
        state.disposed = true
        window.removeEventListener('load', ScrollTrigger.refresh)
        window.clearTimeout(state.leaveTimer)
        window.clearTimeout(state.hideTimer)
        cleanupCallbacks.forEach((callback) => callback())
        clearDelayedCalls()
        frameTrigger.kill()
        state.activeFrameTrigger = null

        if (state.frameRequest) {
          cancelAnimationFrame(state.frameRequest)
          state.frameRequest = null
        }

        cleanupParticles()

        if (state.app) {
          state.app.destroy()
          state.app = null
        }
        state.pixi = null
        state.initPromise = null

        if (state.stageElement) {
          state.stageElement.remove()
        }

        gsap.killTweensOf(layer)
        gsap.killTweensOf(chair)
        video.pause()
        chair.src = chairFrames[0]
        state.currentFrame = 0
      }
    })

    return () => media.revert()
  }, [sectionRef, videoLayerRef, videoRef, chairRef, cards, chairFrames, isDesktop])
}
