export type ConnectorSource = {
  id: string
  title: string
  plain: string
  color: string
  angle: number
}

export type ConnectorOutcome = {
  id: string
  title: string
  plain: string
  color: string
  x: number
}

export const CONNECTOR_SOURCES: ConnectorSource[] = [
  {
    id: 'erp',
    title: 'ERP',
    plain: 'Inventarios, facturación y operación que ya vive en tu empresa.',
    color: '#34c759',
    angle: -Math.PI / 2,
  },
  {
    id: 'crm',
    title: 'CRM',
    plain: 'Clientes, oportunidades y historial comercial que ya alimentan ventas.',
    color: '#1e5eff',
    angle: -Math.PI / 6,
  },
  {
    id: 'core',
    title: 'Core bancario',
    plain: 'Productos, tasas y reglas que el banco ya tiene en sus sistemas.',
    color: '#f59e0b',
    angle: Math.PI / 6,
  },
  {
    id: 'data',
    title: 'Data / BI',
    plain: 'Reportes y métricas que el equipo ya consulta cada semana.',
    color: '#a78bfa',
    angle: Math.PI / 2,
  },
  {
    id: 'api',
    title: 'APIs internas',
    plain: 'Servicios que ya exponen datos sin duplicar silos.',
    color: '#00d4ff',
    angle: (5 * Math.PI) / 6,
  },
  {
    id: 'docs',
    title: 'Documentos',
    plain: 'PDFs, políticas y manuales que hoy están dispersos.',
    color: '#ff6b4a',
    angle: (7 * Math.PI) / 6,
  },
]

export const CONNECTOR_HUB = {
  id: 'tracto',
  title: 'Tracto · Conectores',
  plain: 'No reemplaza tus sistemas: se conecta y unifica la información que ya tienes.',
  color: '#00d4ff',
}

export const CONNECTOR_OUTCOMES: ConnectorOutcome[] = [
  {
    id: 'geo',
    title: 'Mejor posicionamiento GEO',
    plain: 'Propuestas basadas en datos reales del negocio, no en suposiciones.',
    color: '#1e5eff',
    x: -2.4,
  },
  {
    id: 'proposals',
    title: 'Propuestas más precisas',
    plain: 'La IA redacta mejoras alineadas a productos, clientes y compliance.',
    color: '#00d4ff',
    x: 0,
  },
  {
    id: 'clients',
    title: 'Clientes con más eficiencia',
    plain: 'Menos esfuerzo manual, más impacto al aparecer donde el usuario pregunta.',
    color: '#ffffff',
    x: 2.4,
  },
]

export const CONNECTOR_SLIDE_COPY = {
  eyebrow: 'Roadmap · Integraciones',
  headline: 'Conectores a la información que ya tienen',
  subline:
    'ERPs, CRMs y sistemas legados alimentan Tracto para generar mejores propuestas GEO y captar clientes con menos fricción.',
}
