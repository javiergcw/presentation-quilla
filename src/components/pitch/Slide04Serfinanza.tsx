import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide04Serfinanza() {
  return (
    <TractoPitchLayout slide={4} total={PITCH_TOTAL}>
      <p className="pitchEyebrow pitchEyebrow--brand">Banco Serfinanza</p>

      <p className="pitchMetric">
        <span className="pitchMetric__value">200K</span>
        <span className="pitchMetric__unit">clientes</span>
      </p>

      <p className="pitchLead pitchLead--narrow">Líderes en tarjetas de crédito en Colombia.</p>

      <div className="pitchGapBox">
        <p className="pitchGapBox__label">El gap</p>
        <p className="pitchGapBox__line">Cuando alguien le pregunta a ChatGPT</p>
        <p className="pitchGapBox__quote">«¿qué banco usar para mi tarjeta?»</p>
        <p className="pitchGapBox__punch">Serfinanza no aparece.</p>
      </div>
    </TractoPitchLayout>
  )
}
