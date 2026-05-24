import { TractoPitchLayout } from './TractoPitchLayout'
import { N8nPipelineCanvas } from './N8nPipelineCanvas'
import { NIGHT_AUTOMATION_FLOW } from './n8nFlowData'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide13NightAutomation() {
  return (
    <TractoPitchLayout slide={5} total={PITCH_TOTAL} className="pitchSlide--pipeline pitchSlide--pipeline-lg">
      <p className="pitchEyebrow">{NIGHT_AUTOMATION_FLOW.eyebrow}</p>
      <h2 className="pitchTitle pitchTitle--long">{NIGHT_AUTOMATION_FLOW.headline}</h2>
      <p className="pitchPipeline__intro">{NIGHT_AUTOMATION_FLOW.subline}</p>
      <N8nPipelineCanvas flow={NIGHT_AUTOMATION_FLOW} large />
    </TractoPitchLayout>
  )
}
