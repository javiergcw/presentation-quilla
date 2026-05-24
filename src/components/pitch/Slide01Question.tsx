import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide01Question() {
  return (
    <TractoPitchLayout slide={1} total={PITCH_TOTAL} topBrand="TRACTO · PITCH 2026">
      <h1 className="pitchHero pitchHero--question">
        <span>¿Cuándo fue la última</span>
        <span>vez</span>
        <em>que la IA no les</em>
        <em>respondió?</em>
      </h1>
    </TractoPitchLayout>
  )
}
