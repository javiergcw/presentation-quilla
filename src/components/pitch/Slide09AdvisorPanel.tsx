import { SlideProductShowcase } from './SlideProductShowcase'
import advisorImg from '../../assets/3.png'

export function Slide09AdvisorPanel() {
  return (
    <SlideProductShowcase
      slide={9}
      imageSide="left"
      eyebrow="Hacia adentro · Panel del asesor"
      title="El mismo cerebro, para tus asesores"
      subtitle="Los asesores consultan productos, tasas, extractos y requisitos por cliente — con citas verificables y un solo criterio."
      bullets={[
        'Consulta de conocimiento por cliente (C001, C002…)',
        'Sugerencias: productos, tasas, CDT, extractos',
        'Onboarding y vista del cliente actual',
      ]}
      image={advisorImg}
      imageAlt="Panel del asesor TRACTO: consulta de conocimiento para asesores del banco"
    />
  )
}
