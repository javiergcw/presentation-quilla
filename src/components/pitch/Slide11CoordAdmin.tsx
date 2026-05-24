import { SlideProductShowcase } from './SlideProductShowcase'
import adminImg from '../../assets/5.png'

export function Slide11CoordAdmin() {
  return (
    <SlideProductShowcase
      slide={12}
      eyebrow="Coordinación · Vista administrativa"
      title="Información para decidir"
      subtitle="Mercadeo y coordinación ven morosidad, proyección de cartera y alertas por cliente — el lado operativo del banco."
      bullets={[
        'Alertas de morosidad y riesgo por cliente',
        'Proyección optimista, base y pesimista',
        'FAQs y conocimiento centralizado',
      ]}
      image={adminImg}
      imageAlt="Panel de coordinación TRACTO: alertas de morosidad y proyección de cartera"
      layout="stacked"
    />
  )
}
