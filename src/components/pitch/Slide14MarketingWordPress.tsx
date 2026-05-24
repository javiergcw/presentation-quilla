import { TractoPitchLayout } from './TractoPitchLayout'
import { N8nPipelineCanvas } from './N8nPipelineCanvas'
import { MARKETING_WORDPRESS_FLOW } from './n8nFlowData'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide14MarketingWordPress() {
  return (
    <TractoPitchLayout slide={6} total={PITCH_TOTAL} className="pitchSlide--pipeline pitchSlide--pipeline-lg">
      <p className="pitchEyebrow">{MARKETING_WORDPRESS_FLOW.eyebrow}</p>
      <h2 className="pitchTitle pitchTitle--long">{MARKETING_WORDPRESS_FLOW.headline}</h2>
      <p className="pitchPipeline__intro">{MARKETING_WORDPRESS_FLOW.subline}</p>
      <N8nPipelineCanvas flow={MARKETING_WORDPRESS_FLOW} large />
    </TractoPitchLayout>
  )
}
