import tractoLogo from '../../assets/logo.png'
import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

const fronts = [
  {
    id: 'out',
    icon: '🌐',
    label: 'Hacia afuera',
    body: 'Optimiza tu web para ser recomendado por Google AI, ChatGPT y Perplexity.',
  },
  {
    id: 'in',
    icon: '💬',
    label: 'Hacia adentro',
    body: 'Asesor inteligente en tus 3 líneas de WhatsApp. Responde en 2 segundos.',
  },
] as const

export function Slide05Tracto() {
  return (
    <TractoPitchLayout slide={4} total={PITCH_TOTAL} className="pitchSlide--tracto">
      <p className="pitchEyebrow">La solución</p>

      <img src={tractoLogo} alt="Tracto" className="pitchBrandLogo" />

      <p className="pitchTagline">De invisibles ante la IA, a primera opción.</p>

      <div className="pitchSolution">
        {fronts.map((front) => (
          <article key={front.id} className={`pitchSolution__card pitchSolution__card--${front.id}`}>
            <span className="pitchSolution__icon" aria-hidden="true">
              {front.icon}
            </span>
            <p className="pitchSolution__label">{front.label}</p>
            <p className="pitchSolution__body">{front.body}</p>
          </article>
        ))}
      </div>
    </TractoPitchLayout>
  )
}
