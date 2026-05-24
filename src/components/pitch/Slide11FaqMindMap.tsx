import { TractoPitchLayout } from './TractoPitchLayout'
import { FaqMindMapCanvas } from './FaqMindMapCanvas'
import { FAQ_SLIDE_COPY } from './faqMindMapData'
import { PITCH_TOTAL } from './pitchConfig'

export function Slide11FaqMindMap() {
  return (
    <TractoPitchLayout
      slide={11}
      total={PITCH_TOTAL}
      className="pitchSlide--pipeline pitchSlide--pipeline-lg pitchSlide--faq"
    >
      <p className="pitchEyebrow">{FAQ_SLIDE_COPY.eyebrow}</p>
      <h2 className="pitchTitle pitchTitle--long">{FAQ_SLIDE_COPY.headline}</h2>
      <p className="pitchPipeline__intro pitchSlide--faq__intro">{FAQ_SLIDE_COPY.subline}</p>
      <FaqMindMapCanvas />
    </TractoPitchLayout>
  )
}
