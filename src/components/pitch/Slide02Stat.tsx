import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'
const engines = ['ChatGPT', 'Google AI', 'Perplexity', 'Gemini'] as const

export function Slide02Stat() {
  return (
    <TractoPitchLayout slide={2} total={PITCH_TOTAL}>
      <p className="pitchEyebrow">El nuevo escenario</p>

      <p className="pitchStat" aria-label="6 de cada 10">
        <span className="pitchStat__num">6</span>
        <span className="pitchStat__den">/10</span>
      </p>

      <p className="pitchLead">búsquedas en Google ya muestran un resumen de IA</p>

      <p className="pitchSub">
        Antes de cualquier enlace. Antes de cualquier banco.
        <br />
        Si no estás en esa respuesta, no existes.
      </p>

      <div className="pitchPills" aria-label="Motores de IA">
        {engines.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </TractoPitchLayout>
  )
}
