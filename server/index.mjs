import http from 'node:http'
import { URL } from 'node:url'
import { getTeamsWithScores } from './hackadminClient.mjs'

const PORT = Number(process.env.HACKADMIN_API_PORT ?? 8787)

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  })
  res.end(JSON.stringify(payload, null, 2))
}

async function handleTeams(url, res) {
  const eventId = url.searchParams.get('eventId') ?? 'evt_1'
  const track = url.searchParams.get('track')
  const includeScores = url.searchParams.get('scores') !== 'false'

  if (!track) {
    sendJson(res, 400, {
      error: 'Query param "track" es requerido',
      example: '/api/hackadmin/teams?track=cmpg2rsro0001nhcj0s60ukla',
    })
    return
  }

  const data = await getTeamsWithScores({ eventId, track, includeScores })
  sendJson(res, 200, {
    fetchedAt: new Date().toISOString(),
    ...data,
  })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)

    if (req.method === 'GET' && url.pathname === '/api/hackadmin/health') {
      sendJson(res, 200, { ok: true, port: PORT })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/hackadmin/teams') {
      await handleTeams(url, res)
      return
    }

    sendJson(res, 404, {
      error: 'Ruta no encontrada',
      routes: ['GET /api/hackadmin/health', 'GET /api/hackadmin/teams?track=...'],
    })
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
  }
})

server.listen(PORT, () => {
  console.log(`Hackadmin proxy → http://localhost:${PORT}`)
  console.log(`Ejemplo: http://localhost:${PORT}/api/hackadmin/teams?track=cmpg2rsro0001nhcj0s60ukla`)
})
