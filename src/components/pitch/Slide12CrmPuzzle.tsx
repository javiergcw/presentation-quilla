import { TractoPitchLayout } from './TractoPitchLayout'
import { CrmPuzzleCanvas } from './CrmPuzzleCanvas'
import { CRM_SLIDE_COPY } from './crmPuzzleData'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide12CrmPuzzle() {
  return (
    <TractoPitchLayout
      slide={13}
      total={PITCH_TOTAL}
      className="pitchSlide--pipeline pitchSlide--pipeline-lg pitchSlide--crm"
    >
      <p className="pitchEyebrow">{CRM_SLIDE_COPY.eyebrow}</p>
      <h2 className="pitchTitle pitchTitle--long">{CRM_SLIDE_COPY.headline}</h2>
      <p className="pitchPipeline__intro">{CRM_SLIDE_COPY.subline}</p>
      <CrmPuzzleCanvas />
    </TractoPitchLayout>
  )
}
