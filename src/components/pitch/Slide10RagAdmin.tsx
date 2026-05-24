import { SlideProductShowcase } from './SlideProductShowcase'
import ragImg from '../../assets/4.png'

export function Slide10RagAdmin() {
  return (
    <SlideProductShowcase
      slide={10}
      eyebrow="Base de conocimiento · RAG"
      title="Aquí se alimenta la IA"
      subtitle="El administrador carga PDFs, fragmenta el conocimiento y activa solo los documentos que el agente puede usar."
      bullets={[
        'Importar manuales, tarifas, políticas y protocolos',
        'Modo estricto: solo responde con base oficial',
        'Fragmentos etiquetados: tarjeta, cupos, tasas…',
      ]}
      image={ragImg}
      imageAlt="Administrador de conocimiento TRACTO: gestión de fragmentos RAG"
    />
  )
}
