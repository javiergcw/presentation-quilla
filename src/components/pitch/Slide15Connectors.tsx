import { TractoPitchLayout } from './TractoPitchLayout'
import { ConnectorsHubCanvas } from './ConnectorsHubCanvas'
import { CONNECTOR_SLIDE_COPY } from './connectorFlowData'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide15Connectors() {
  return (
    <TractoPitchLayout slide={15} total={PITCH_TOTAL} className="pitchSlide--pipeline pitchSlide--connectors">
      <p className="pitchEyebrow">{CONNECTOR_SLIDE_COPY.eyebrow}</p>
      <h2 className="pitchTitle pitchTitle--long">{CONNECTOR_SLIDE_COPY.headline}</h2>
      <p className="pitchPipeline__intro">{CONNECTOR_SLIDE_COPY.subline}</p>
      <ConnectorsHubCanvas />
    </TractoPitchLayout>
  )
}
