import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { EyeBall } from './eye-ball'
import { Pupil } from './pupil'

type AnimatedCharactersProps = {
  isTyping?: boolean
  showPassword?: boolean
  passwordLength?: number
}

const PURPLE_COLOR = '#6C3FF5'
const BLACK_COLOR = '#2D2D2D'
const ORANGE_COLOR = '#FF9B6B'
const YELLOW_COLOR = '#E8D754'

export function AnimatedCharacters({
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
}: AnimatedCharactersProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafIdRef = useRef(0)
  const quickToRef = useRef<Record<
    string,
    ReturnType<typeof gsap.quickTo>
  > | null>(null)
  const isLookingRef = useRef(false)

  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  const purpleFaceRef = useRef<HTMLDivElement>(null)
  const blackFaceRef = useRef<HTMLDivElement>(null)
  const yellowFaceRef = useRef<HTMLDivElement>(null)
  const orangeFaceRef = useRef<HTMLDivElement>(null)
  const yellowMouthRef = useRef<HTMLDivElement>(null)

  const stateRef = useRef({
    isTyping: false,
    isHidingPassword: false,
    isShowingPassword: false,
    isLooking: false,
  })

  const isHidingPassword = passwordLength > 0 && !showPassword
  const isShowingPassword = passwordLength > 0 && showPassword

  useEffect(() => {
    stateRef.current = {
      isTyping,
      isHidingPassword,
      isShowingPassword,
      isLooking: isLookingRef.current,
    }
  }, [isTyping, isHidingPassword, isShowingPassword])

  useEffect(() => {
    gsap.set('.pupil', { x: 0, y: 0 })
    gsap.set('.eyeball-pupil', { x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const purple = purpleRef.current
    const black = blackRef.current
    const orange = orangeRef.current
    const yellow = yellowRef.current
    const purpleFace = purpleFaceRef.current
    const blackFace = blackFaceRef.current
    const orangeFace = orangeFaceRef.current
    const yellowFace = yellowFaceRef.current
    const yellowMouth = yellowMouthRef.current
    const container = containerRef.current

    if (
      !purple ||
      !black ||
      !orange ||
      !yellow ||
      !purpleFace ||
      !blackFace ||
      !orangeFace ||
      !yellowFace ||
      !yellowMouth ||
      !container
    ) {
      return
    }

    const qt = {
      purpleSkew: gsap.quickTo(purple, 'skewX', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      blackSkew: gsap.quickTo(black, 'skewX', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      orangeSkew: gsap.quickTo(orange, 'skewX', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      yellowSkew: gsap.quickTo(yellow, 'skewX', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      purpleX: gsap.quickTo(purple, 'x', { duration: 0.3, ease: 'power2.out' }),
      blackX: gsap.quickTo(black, 'x', { duration: 0.3, ease: 'power2.out' }),
      purpleHeight: gsap.quickTo(purple, 'height', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      purpleFaceLeft: gsap.quickTo(purpleFace, 'left', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      purpleFaceTop: gsap.quickTo(purpleFace, 'top', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      blackFaceLeft: gsap.quickTo(blackFace, 'left', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      blackFaceTop: gsap.quickTo(blackFace, 'top', {
        duration: 0.3,
        ease: 'power2.out',
      }),
      orangeFaceX: gsap.quickTo(orangeFace, 'x', {
        duration: 0.2,
        ease: 'power2.out',
      }),
      orangeFaceY: gsap.quickTo(orangeFace, 'y', {
        duration: 0.2,
        ease: 'power2.out',
      }),
      yellowFaceX: gsap.quickTo(yellowFace, 'x', {
        duration: 0.2,
        ease: 'power2.out',
      }),
      yellowFaceY: gsap.quickTo(yellowFace, 'y', {
        duration: 0.2,
        ease: 'power2.out',
      }),
      mouthX: gsap.quickTo(yellowMouth, 'x', {
        duration: 0.2,
        ease: 'power2.out',
      }),
      mouthY: gsap.quickTo(yellowMouth, 'y', {
        duration: 0.2,
        ease: 'power2.out',
      }),
    }
    quickToRef.current = qt

    const calcPos = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 3
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      return {
        faceX: Math.max(-15, Math.min(15, dx / 20)),
        faceY: Math.max(-10, Math.min(10, dy / 30)),
        bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
      }
    }

    const calcEyePos = (el: HTMLElement, maxDist: number) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDist)
      const angle = Math.atan2(dy, dx)
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
    }

    const tick = () => {
      const currentContainer = containerRef.current
      if (!currentContainer) return

      const {
        isTyping: typing,
        isHidingPassword: hiding,
        isShowingPassword: showing,
        isLooking: looking,
      } = stateRef.current

      if (purpleRef.current && !showing) {
        const pp = calcPos(purpleRef.current)
        if (typing || hiding) {
          qt.purpleSkew(pp.bodySkew - 12)
          qt.purpleX(40)
          qt.purpleHeight(440)
        } else {
          qt.purpleSkew(pp.bodySkew)
          qt.purpleX(0)
          qt.purpleHeight(400)
        }
      }

      if (blackRef.current && !showing) {
        const bp = calcPos(blackRef.current)
        if (looking) {
          qt.blackSkew(bp.bodySkew * 1.5 + 10)
          qt.blackX(20)
        } else if (typing || hiding) {
          qt.blackSkew(bp.bodySkew * 1.5)
          qt.blackX(0)
        } else {
          qt.blackSkew(bp.bodySkew)
          qt.blackX(0)
        }
      }

      if (orangeRef.current && !showing) {
        const op = calcPos(orangeRef.current)
        qt.orangeSkew(op.bodySkew)
      }

      if (yellowRef.current && !showing) {
        const yp = calcPos(yellowRef.current)
        qt.yellowSkew(yp.bodySkew)
      }

      if (purpleRef.current && purpleFaceRef.current && !showing && !looking) {
        const pp = calcPos(purpleRef.current)
        const purpleFaceX =
          pp.faceX >= 0 ? Math.min(25, pp.faceX * 1.5) : pp.faceX
        qt.purpleFaceLeft(45 + purpleFaceX)
        qt.purpleFaceTop(40 + pp.faceY)
      }

      if (blackRef.current && blackFaceRef.current && !showing && !looking) {
        const bp = calcPos(blackRef.current)
        qt.blackFaceLeft(26 + bp.faceX)
        qt.blackFaceTop(32 + bp.faceY)
      }

      if (orangeRef.current && orangeFaceRef.current && !showing) {
        const op = calcPos(orangeRef.current)
        qt.orangeFaceX(op.faceX)
        qt.orangeFaceY(op.faceY)
      }

      if (
        yellowRef.current &&
        yellowFaceRef.current &&
        yellowMouthRef.current &&
        !showing
      ) {
        const yp = calcPos(yellowRef.current)
        qt.yellowFaceX(yp.faceX)
        qt.yellowFaceY(yp.faceY)
        qt.mouthX(yp.faceX)
        qt.mouthY(yp.faceY)
      }

      if (!showing) {
        currentContainer.querySelectorAll('.pupil').forEach((p) => {
          const el = p as HTMLElement
          const maxDist = Number(el.dataset.maxDistance) || 5
          const ePos = calcEyePos(el, maxDist)
          gsap.set(el, { x: ePos.x, y: ePos.y })
        })

        if (!looking) {
          currentContainer.querySelectorAll('.eyeball').forEach((eb) => {
            const el = eb as HTMLElement
            const maxDist = Number(el.dataset.maxDistance) || 10
            const pupil = el.querySelector('.eyeball-pupil') as HTMLElement
            if (!pupil) return
            const ePos = calcEyePos(el, maxDist)
            gsap.set(pupil, { x: ePos.x, y: ePos.y })
          })
        }
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafIdRef.current)
      quickToRef.current = null
    }
  }, [])

  useEffect(() => {
    const purpleEyeballs = purpleRef.current?.querySelectorAll('.eyeball')
    if (!purpleEyeballs?.length) return

    let blinkTimer: ReturnType<typeof setTimeout>

    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          purpleEyeballs.forEach((el) => {
            gsap.to(el, { height: 2, duration: 0.08, ease: 'power2.in' })
          })
          setTimeout(() => {
            purpleEyeballs.forEach((el) => {
              const htmlEl = el as HTMLElement
              const size = Number(htmlEl.style.width.replace('px', '')) || 18
              gsap.to(el, { height: size, duration: 0.08, ease: 'power2.out' })
            })
            scheduleBlink()
          }, 150)
        },
        Math.random() * 4000 + 3000
      )
    }

    scheduleBlink()
    return () => clearTimeout(blinkTimer)
  }, [])

  useEffect(() => {
    const blackEyeballs = blackRef.current?.querySelectorAll('.eyeball')
    if (!blackEyeballs?.length) return

    let blinkTimer: ReturnType<typeof setTimeout>

    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          blackEyeballs.forEach((el) => {
            gsap.to(el, { height: 2, duration: 0.08, ease: 'power2.in' })
          })
          setTimeout(() => {
            blackEyeballs.forEach((el) => {
              const htmlEl = el as HTMLElement
              const size = Number(htmlEl.style.width.replace('px', '')) || 16
              gsap.to(el, { height: size, duration: 0.08, ease: 'power2.out' })
            })
            scheduleBlink()
          }, 150)
        },
        Math.random() * 4000 + 3000
      )
    }

    scheduleBlink()
    return () => clearTimeout(blinkTimer)
  }, [])

  useEffect(() => {
    if (!isShowingPassword || passwordLength <= 0) return

    const purpleEyePupils =
      purpleRef.current?.querySelectorAll('.eyeball-pupil')
    if (!purpleEyePupils?.length) return

    let peekTimer: ReturnType<typeof setTimeout>

    const schedulePeek = () => {
      peekTimer = setTimeout(
        () => {
          purpleEyePupils.forEach((p) => {
            gsap.to(p, {
              x: 4,
              y: 5,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto',
            })
          })
          quickToRef.current?.purpleFaceLeft(20)
          quickToRef.current?.purpleFaceTop(35)

          setTimeout(() => {
            purpleEyePupils.forEach((p) => {
              gsap.to(p, {
                x: -4,
                y: -4,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto',
              })
            })
            schedulePeek()
          }, 800)
        },
        Math.random() * 3000 + 2000
      )
    }

    schedulePeek()
    return () => clearTimeout(peekTimer)
  }, [isShowingPassword, passwordLength])

  useEffect(() => {
    let lookingTimer: ReturnType<typeof setTimeout>

    const applyLookAtEachOther = () => {
      const qt = quickToRef.current
      if (qt) {
        qt.purpleFaceLeft(55)
        qt.purpleFaceTop(65)
        qt.blackFaceLeft(32)
        qt.blackFaceTop(12)
      }
      purpleRef.current?.querySelectorAll('.eyeball-pupil').forEach((p) => {
        gsap.to(p, {
          x: 3,
          y: 4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
      blackRef.current?.querySelectorAll('.eyeball-pupil').forEach((p) => {
        gsap.to(p, {
          x: 0,
          y: -4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
    }

    if (isTyping && !isShowingPassword) {
      isLookingRef.current = true
      stateRef.current.isLooking = true
      applyLookAtEachOther()

      lookingTimer = setTimeout(() => {
        isLookingRef.current = false
        stateRef.current.isLooking = false
        purpleRef.current?.querySelectorAll('.eyeball-pupil').forEach((p) => {
          gsap.killTweensOf(p)
        })
      }, 800)
    } else {
      isLookingRef.current = false
      stateRef.current.isLooking = false
    }

    return () => clearTimeout(lookingTimer)
  }, [isTyping, isShowingPassword])

  useEffect(() => {
    const qt = quickToRef.current
    if (!qt) return

    if (isShowingPassword) {
      qt.purpleSkew(0)
      qt.blackSkew(0)
      qt.orangeSkew(0)
      qt.yellowSkew(0)
      qt.purpleX(0)
      qt.blackX(0)
      qt.purpleHeight(400)
      qt.purpleFaceLeft(20)
      qt.purpleFaceTop(35)
      qt.blackFaceLeft(10)
      qt.blackFaceTop(28)
      qt.orangeFaceX(50 - 82)
      qt.orangeFaceY(85 - 90)
      qt.yellowFaceX(20 - 52)
      qt.yellowFaceY(35 - 40)
      qt.mouthX(10 - 40)
      qt.mouthY(0)

      purpleRef.current?.querySelectorAll('.eyeball-pupil').forEach((p) => {
        gsap.to(p, {
          x: -4,
          y: -4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
      blackRef.current?.querySelectorAll('.eyeball-pupil').forEach((p) => {
        gsap.to(p, {
          x: -4,
          y: -4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
      orangeRef.current?.querySelectorAll('.pupil').forEach((p) => {
        gsap.to(p, {
          x: -5,
          y: -4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
      yellowRef.current?.querySelectorAll('.pupil').forEach((p) => {
        gsap.to(p, {
          x: -5,
          y: -4,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      })
    } else if (isHidingPassword) {
      qt.purpleFaceLeft(55)
      qt.purpleFaceTop(65)
    }
  }, [isShowingPassword, isHidingPassword])

  return (
    <div
      ref={containerRef}
      className='relative h-[400px] w-full max-w-[550px]'
      aria-hidden
    >
      <div
        ref={purpleRef}
        className='absolute bottom-0 left-[70px] z-1 w-[180px] origin-bottom'
        style={{
          height: 400,
          backgroundColor: PURPLE_COLOR,
          borderRadius: '10px 10px 0 0',
          willChange: 'transform',
        }}
      >
        <div
          ref={purpleFaceRef}
          className='absolute flex gap-8'
          style={{ left: 45, top: 40 }}
        >
          <EyeBall size='18px' pupilSize='7px' maxDistance={5} />
          <EyeBall size='18px' pupilSize='7px' maxDistance={5} />
        </div>
      </div>

      <div
        ref={blackRef}
        className='absolute bottom-0 left-[240px] z-2 w-[120px] origin-bottom'
        style={{
          height: 310,
          backgroundColor: BLACK_COLOR,
          borderRadius: '8px 8px 0 0',
          willChange: 'transform',
        }}
      >
        <div
          ref={blackFaceRef}
          className='absolute flex gap-6'
          style={{ left: 26, top: 32 }}
        >
          <EyeBall size='16px' pupilSize='6px' maxDistance={4} />
          <EyeBall size='16px' pupilSize='6px' maxDistance={4} />
        </div>
      </div>

      <div
        ref={orangeRef}
        className='absolute bottom-0 left-0 z-3 w-[240px] origin-bottom'
        style={{
          height: 200,
          backgroundColor: ORANGE_COLOR,
          borderRadius: '120px 120px 0 0',
          willChange: 'transform',
        }}
      >
        <div
          ref={orangeFaceRef}
          className='absolute flex gap-8'
          style={{ left: 82, top: 90 }}
        >
          <Pupil size='12px' maxDistance={5} />
          <Pupil size='12px' maxDistance={5} />
        </div>
      </div>

      <div
        ref={yellowRef}
        className='absolute bottom-0 left-[310px] z-4 w-[140px] origin-bottom'
        style={{
          height: 230,
          backgroundColor: YELLOW_COLOR,
          borderRadius: '70px 70px 0 0',
          willChange: 'transform',
        }}
      >
        <div
          ref={yellowFaceRef}
          className='absolute flex gap-6'
          style={{ left: 52, top: 40 }}
        >
          <Pupil size='12px' maxDistance={5} />
          <Pupil size='12px' maxDistance={5} />
        </div>
        <div
          ref={yellowMouthRef}
          className='absolute rounded-full bg-foreground'
          style={{ width: 80, height: 4, left: 40, top: 88 }}
        />
      </div>
    </div>
  )
}
