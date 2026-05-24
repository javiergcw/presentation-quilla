export type CrmPiece = {
  id: string
  name: string
  short: string
  plain: string
  color: string
  angle: number
}

export const CRM_PIECES: CrmPiece[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    short: 'SF',
    plain: 'Clientes, oportunidades y pipeline comercial que el banco ya usa cada día.',
    color: '#00a1e0',
    angle: -Math.PI / 2,
  },
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    short: 'D365',
    plain: 'Relación con el cliente y procesos internos conectados al core del negocio.',
    color: '#5c2d91',
    angle: -Math.PI / 2 + (2 * Math.PI) / 3,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    short: 'HS',
    plain: 'Marketing, leads y nurturing — la capa que alimenta la punta del embudo.',
    color: '#ff7a59',
    angle: -Math.PI / 2 + (4 * Math.PI) / 3,
  },
]

export const CRM_HUB = {
  name: 'Tracto',
  plain: 'El círculo se completa: unimos CRM + web + IA sin reemplazar lo que ya tienen.',
  color: '#00d4ff',
}

export const CRM_SLIDE_COPY = {
  eyebrow: 'Integraciones · CRM bancario',
  headline: 'Los CRM que ya usan los bancos, encajados en Tracto',
  subline:
    'Salesforce, Dynamics 365 y HubSpot se conectan como piezas de un rompecabezas para alimentar propuestas GEO y captación.',
}

export const CRM_FULL_STEP = {
  title: 'Rompecabezas completo',
  plain: 'Tres CRMs + Tracto = una sola vista del cliente para posicionamiento y contenido.',
}
