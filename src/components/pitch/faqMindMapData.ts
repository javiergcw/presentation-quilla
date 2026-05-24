export type FaqStep = {
  id: string
  title: string
  plain: string
}

/** Intervalo entre cada pregunta nueva en la slide 11 */
export const FAQ_QUESTION_INTERVAL_MS = 2000

export const FAQ_SLIDE_COPY = {
  eyebrow: 'Flujo cliente · Tiempo real',
  headline: 'Cliente → Chatbot → Panel',
  subline:
    'El cliente pregunta en el móvil, el chatbot procesa y cada consulta se suma al panel.',
}

export const FAQ_FLOW_STEPS: FaqStep[] = [
  {
    id: 'client',
    title: 'Cliente móvil',
    plain: 'El usuario hace la consulta desde su app o WhatsApp.',
  },
  {
    id: 'chatbot',
    title: 'Pasa por el chatbot',
    plain: 'El asistente clasifica la duda y la envía al flujo de conocimiento.',
  },
  {
    id: 'faq',
    title: 'Panel de consultas',
    plain: 'Cada 2 s entra una nueva al panel grande — 20 estándar, una por una.',
  },
  {
    id: 'notify',
    title: 'Alertas en la app',
    plain: 'El cliente recibe respuesta y sugerencias en el teléfono.',
  },
  {
    id: 'rank',
    title: 'Productos rankeados',
    plain: 'También ve los productos más consultados en su móvil.',
  },
  {
    id: 'ready',
    title: 'Ciclo completo',
    plain: 'Móvil → chatbot → FAQ siempre sincronizados.',
  },
]

/** Catálogo estándar: se muestran en orden, 1 cada 2 s */
export const FAQ_STANDARD_QUESTIONS: readonly string[] = [
  '¿Cuál es la tasa del CDT hoy?',
  '¿Cuánto es la cuota de manejo de la tarjeta?',
  '¿Cómo abro una cuenta de ahorros digital?',
  '¿El CDT está cubierto por Fogafín?',
  '¿Cuál es el pago mínimo de la tarjeta Oro?',
  '¿Puedo retirar sin tarjeta en el cajero?',
  '¿Qué plazo tiene el CDT a 90 días?',
  '¿Cómo activo la banca virtual?',
  '¿Dónde consulto extractos en línea?',
  '¿Qué requisitos pide el crédito de libre inversión?',
  '¿Cómo bloqueo la tarjeta por pérdida?',
  '¿Hay costo por transferencia a otro banco?',
  '¿A qué hora abren las sucursales?',
  '¿Cómo solicito un crédito vehículo?',
  '¿Puedo pagar servicios desde la app?',
  '¿Qué beneficios tiene la tarjeta Platinum?',
  '¿Cómo actualizo mis datos personales?',
  '¿Cuánto demora la aprobación del CDT?',
  '¿Dónde veo el estado de mi solicitud?',
  '¿Cómo contacto a un asesor en línea?',
]

export const FAQ_NOTIFICATIONS = [
  { id: 'n1', text: 'Respuesta lista · CDT', color: '#00d4ff' },
  { id: 'n2', text: 'FAQ sugerido en tu app', color: '#1e5eff' },
  { id: 'n3', text: 'Top productos actualizado', color: '#a78bfa' },
] as const

export const FAQ_RANKED_PRODUCTS = [
  { rank: 1, name: 'CDT', count: 48, color: '#00d4ff' },
  { rank: 2, name: 'Tarjeta crédito', count: 36, color: '#1e5eff' },
  { rank: 3, name: 'Banca virtual', count: 22, color: '#a78bfa' },
  { rank: 4, name: 'Cuenta de ahorros', count: 15, color: '#34c759' },
] as const

/** Paso del panel lateral según cuántas preguntas ya se añadieron */
export function faqStepIndexForCount(count: number): number {
  if (count <= 1) return 0
  if (count <= 4) return 1
  if (count <= 9) return 2
  if (count <= 14) return 3
  if (count <= 17) return 4
  return 5
}
