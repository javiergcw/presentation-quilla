export type PipelineNode = {
  id: string
  title: string
  plain: string
  color: string
  row: number
  col: number
}

export type PipelineFlow = {
  id: string
  eyebrow: string
  headline: string
  subline: string
  nodes: PipelineNode[]
  edges: [string, string][]
}

/** Flujo nocturno automatizado (n8n) — lenguaje para audiencia no técnica */
export const NIGHT_AUTOMATION_FLOW: PipelineFlow = {
  id: 'night',
  eyebrow: 'Automatización nocturna · n8n',
  headline: 'Cada noche, el sistema trabaja solo',
  subline: 'De la auditoría GEO a comprobar si Serfinanza aparece en las respuestas de la IA',
  nodes: [
    {
      id: 'cron',
      title: 'CRON 2:00 AM',
      plain: 'Se activa solo cada madrugada, sin que nadie pulse un botón.',
      color: '#ff6b4a',
      row: 0,
      col: 0,
    },
    {
      id: 'crawl',
      title: 'Revisa la página',
      plain: 'Recorre el sitio web como un visitante y recoge todo el contenido.',
      color: '#1e5eff',
      row: 0,
      col: 1,
    },
    {
      id: 'geo',
      title: 'Auditoría GEO',
      plain: 'Busca errores de ubicación y contexto local que confunden a la IA.',
      color: '#00d4ff',
      row: 0,
      col: 2,
    },
    {
      id: 'save-audit',
      title: 'Guarda hallazgos',
      plain: 'Los problemas quedan registrados en una hoja de cálculo.',
      color: '#34c759',
      row: 0,
      col: 3,
    },
    {
      id: 'claude',
      title: 'Claude analiza',
      plain: 'La IA lee los errores y redacta una propuesta de mejora concreta.',
      color: '#a78bfa',
      row: 0,
      col: 4,
    },
    {
      id: 'save-proposal',
      title: 'Guarda propuesta',
      plain: 'La propuesta queda lista para que marketing la revise al día siguiente.',
      color: '#34c759',
      row: 1,
      col: 4,
    },
    {
      id: 'compliance',
      title: 'Compliance (8 criterios)',
      plain: 'Un agente valida que la idea cumpla las 8 reglas del banco.',
      color: '#f59e0b',
      row: 1,
      col: 3,
    },
    {
      id: 'visibility',
      title: 'Visibilidad en LLM',
      plain: 'Lanza 20–50 preguntas al modelo: «¿Mejor tarjeta sin cuota de manejo?»',
      color: '#00d4ff',
      row: 1,
      col: 2,
    },
    {
      id: 'serfinanza',
      title: '¿Aparece Serfinanza?',
      plain: 'Mide si la marca sale citada cuando el usuario pregunta a la IA.',
      color: '#1e5eff',
      row: 1,
      col: 1,
    },
    {
      id: 'report',
      title: 'Informe listo',
      plain: 'Todo queda guardado para la revisión de las 7:00 AM.',
      color: '#ffffff',
      row: 1,
      col: 0,
    },
  ],
  edges: [
    ['cron', 'crawl'],
    ['crawl', 'geo'],
    ['geo', 'save-audit'],
    ['save-audit', 'claude'],
    ['claude', 'save-proposal'],
    ['save-proposal', 'compliance'],
    ['compliance', 'visibility'],
    ['visibility', 'serfinanza'],
    ['serfinanza', 'report'],
  ],
}

/** Flujo matutino marketing + WordPress */
export const MARKETING_WORDPRESS_FLOW: PipelineFlow = {
  id: 'morning',
  eyebrow: '7:00 AM · Equipo de marketing',
  headline: 'Aprueban la idea y el borrador aparece en WordPress',
  subline: 'Sin tocar código: revisan, deciden y editan como siempre en el CMS',
  nodes: [
    {
      id: 'alarm',
      title: '7:00 AM',
      plain: 'Marketing entra a la plataforma con el informe de la noche.',
      color: '#ff6b4a',
      row: 0,
      col: 0,
    },
    {
      id: 'dashboard',
      title: 'Revisa plataforma',
      plain: 'Ve auditoría, propuesta y si Serfinanza apareció en las pruebas con IA.',
      color: '#1e5eff',
      row: 0,
      col: 1,
    },
    {
      id: 'read',
      title: 'Lee la propuesta',
      plain: 'Abre el documento generado automáticamente la noche anterior.',
      color: '#34c759',
      row: 0,
      col: 2,
    },
    {
      id: 'decision',
      title: 'Aprueba / Desaprueba',
      plain: 'Un clic decide si se publica el contenido o se descarta.',
      color: '#f59e0b',
      row: 0,
      col: 3,
    },
    {
      id: 'generate',
      title: 'Genera contenido',
      plain: 'El sistema redacta el artículo optimizado para web y SEO.',
      color: '#a78bfa',
      row: 1,
      col: 3,
    },
    {
      id: 'wordpress',
      title: 'Borrador en WordPress',
      plain: 'Se crea automáticamente un borrador en la base de datos del sitio.',
      color: '#21759b',
      row: 1,
      col: 2,
    },
    {
      id: 'edit',
      title: 'Editan en WordPress',
      plain: 'Marketing abre WordPress como siempre: editar, aprobar o eliminar.',
      color: '#00d4ff',
      row: 1,
      col: 1,
    },
    {
      id: 'live',
      title: 'Publicación humana',
      plain: 'Solo publican cuando el equipo está conforme — control total.',
      color: '#ffffff',
      row: 1,
      col: 0,
    },
  ],
  edges: [
    ['alarm', 'dashboard'],
    ['dashboard', 'read'],
    ['read', 'decision'],
    ['decision', 'generate'],
    ['generate', 'wordpress'],
    ['wordpress', 'edit'],
    ['edit', 'live'],
  ],
}
