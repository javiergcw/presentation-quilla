import { motion } from 'framer-motion'
import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

const easeOut = [0.22, 1, 0.36, 1] as const

type SlideProductShowcaseProps = {
  slide: number
  eyebrow: string
  title: string
  subtitle: string
  bullets?: readonly string[]
  image: string
  imageAlt: string
  layout?: 'split' | 'stacked'
  imageSide?: 'left' | 'right'
}

export function SlideProductShowcase({
  slide,
  eyebrow,
  title,
  subtitle,
  bullets,
  image,
  imageAlt,
  layout = 'split',
  imageSide = 'right',
}: SlideProductShowcaseProps) {
  const isSplit = layout === 'split'

  const copy = (
    <motion.div
      className="pitchShowcase__copy"
      initial={{ opacity: 0, x: isSplit && imageSide === 'right' ? -28 : isSplit ? 28 : 0, y: isSplit ? 0 : -14 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <p className="pitchEyebrow">{eyebrow}</p>
      <h2 className="pitchShowcase__title">{title}</h2>
      <p className="pitchShowcase__subtitle">{subtitle}</p>
      {bullets?.length ? (
        <ul className="pitchShowcase__bullets">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </motion.div>
  )

  const frame = (
    <motion.div
      className="pitchShowcase__frame"
      initial={{ opacity: 0, scale: isSplit ? 0.88 : 0.82, x: isSplit && imageSide === 'right' ? 32 : isSplit ? -32 : 0, y: isSplit ? 0 : 36 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: isSplit ? 0.12 : 0.15, ease: easeOut }}
    >
      <motion.div
        className="pitchShowcase__glow"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.25 }}
      />
      <img src={image} alt={imageAlt} className="pitchShowcase__img" />
    </motion.div>
  )

  return (
    <TractoPitchLayout slide={slide} total={PITCH_TOTAL} className="pitchSlide--showcase">
      <div
        className={`pitchShowcase ${isSplit ? 'pitchShowcase--split' : 'pitchShowcase--stacked'} ${imageSide === 'left' ? 'pitchShowcase--imageLeft' : ''}`}
      >
        {imageSide === 'left' ? (
          <>
            {frame}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {frame}
          </>
        )}
      </div>
    </TractoPitchLayout>
  )
}
