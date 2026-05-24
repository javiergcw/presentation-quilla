import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide03VisibilityGap() {
  return (
    <TractoPitchLayout slide={3} total={PITCH_TOTAL}>
      <p className="pitchEyebrow">El problema</p>

      <h2 className="pitchTitle pitchTitle--long">
        La brecha de accesibilidad al conocimiento financiero{' '}
        <span className="pitchTitle__script">(Interno y Externo)</span>
      </h2>

      <div className="pitchCompare">
        <article className="pitchCompare__card">
          <span className="pitchCompare__icon" aria-hidden="true">
            🚗
          </span>
          <p className="pitchCompare__label">Antes</p>
          <p className="pitchCompare__text">
            El cliente buscaba, encontraba el sitio web, llamaba.
          </p>
        </article>

        <span className="pitchCompare__arrow" aria-hidden="true">
          →
        </span>

        <article className="pitchCompare__card">
          <span className="pitchCompare__icon" aria-hidden="true">
            🤖
          </span>
          <p className="pitchCompare__label">Ahora</p>
          <p className="pitchCompare__text">
            La IA responde. El cliente elige el banco que ella recomienda.
          </p>
        </article>
      </div>

      <p className="pitchFooter">
        Si la IA no sabe que existes, <strong>el cliente tampoco lo sabrá.</strong>
      </p>
    </TractoPitchLayout>
  )
}
