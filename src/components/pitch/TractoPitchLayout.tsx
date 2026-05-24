import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type TractoPitchLayoutProps = {
  slide: number
  total: number
  children: ReactNode
  topBrand?: string
  className?: string
}

export function TractoPitchLayout({
  slide,
  total,
  children,
  topBrand,
  className = '',
}: TractoPitchLayoutProps) {
  return (
    <motion.div
      className={`pitchSlide ${className}`.trim()}
      role="region"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="pitchSlide__grid" aria-hidden="true" />

      <p className="pitchSlide__counter">
        PITCH · {slide}/{total}
      </p>

      {topBrand ? <p className="pitchSlide__topBrand">{topBrand}</p> : null}

      <div className="pitchSlide__content">{children}</div>

      <footer className="pitchSlide__footer">
        <div className="pitchSlide__progress" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i === slide - 1 ? 'is-active' : ''} />
          ))}
        </div>
        <p className="pitchSlide__hint">Presiona para continuar</p>
      </footer>
    </motion.div>
  )
}
