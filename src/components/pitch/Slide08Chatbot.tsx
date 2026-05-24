import { SlideProductShowcase } from './SlideProductShowcase'
import chatbotImg from '../../assets/2.png'

export function Slide08Chatbot() {
  return (
    <SlideProductShowcase
      slide={8}
      eyebrow="Hacia adentro · Asistente IA"
      title="El chatbot del banco"
      subtitle="Asistente de Serfinanza para clientes: responde al instante con información oficial sobre productos, CDT, tarjetas y banca virtual."
      bullets={[
        'Canal conversacional 24/7',
        'Respuestas verificadas · «Información oficial»',
        'Sin contradicciones entre canales',
      ]}
      image={chatbotImg}
      imageAlt="TRACTO Asistente: chatbot del banco para clientes con respuestas sobre CDT y Serfinanza"
    />
  )
}
