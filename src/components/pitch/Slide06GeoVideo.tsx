import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

type Slide06GeoVideoProps = {
  src: string
  slide: 6 | 7
  title: string
  subtitle: string
}
const easeOut = [0.22, 1, 0.36, 1] as const

export function Slide06GeoVideo({ src, slide, title, subtitle }: Slide06GeoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const timer = window.setTimeout(() => {
      video.currentTime = 0
      const playPromise = video.play()
      if (playPromise) {
        playPromise.catch(() => {
          video.muted = true
          void video.play()
        })
      }
    }, 400)

    return () => {
      window.clearTimeout(timer)
      video.pause()
      video.currentTime = 0
    }
  }, [src])

  return (
    <TractoPitchLayout slide={slide} total={PITCH_TOTAL} className="pitchSlide--video">
      <div className="pitchVideo">
        <motion.header
          className="pitchVideo__header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <p className="pitchEyebrow">GEO · Hacia afuera · Paso {slide - 5} de 2</p>
          <h2 className="pitchVideo__title">{title}</h2>
          <p className="pitchVideo__subtitle">{subtitle}</p>
        </motion.header>

        <motion.div
          className="pitchVideo__frame"
          initial={{ opacity: 0, scale: 0.78, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: easeOut }}
        >
          <motion.div
            className="pitchVideo__glow"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.35, ease: easeOut }}
          />
          <video
            ref={videoRef}
            className="pitchVideo__player"
            src={src}
            controls
            playsInline
            preload="auto"
          />
        </motion.div>
      </div>
    </TractoPitchLayout>
  )
}
