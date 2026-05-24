const DEFAULT_BASE = 'https://hackadmin.feanware.com'

const CARD_SPLIT = /<div class="group rounded-xl/g

export function getSessionCookie() {
  const token = process.env.HACKADMIN_SESSION_TOKEN?.trim()
  if (!token) {
    throw new Error(
      'Falta HACKADMIN_SESSION_TOKEN en .env (cookie __Secure-authjs.session-token)',
    )
  }
  return `__Secure-authjs.session-token=${token}`
}

export async function fetchHackadmin(path, { cookie, baseUrl = DEFAULT_BASE } = {}) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url, {
    headers: {
      Cookie: cookie,
      'User-Agent': 'TractoHackadminProxy/1.0',
      Accept: 'text/html,application/json',
    },
  })

  const body = await response.text()
  return { url, status: response.status, contentType: response.headers.get('content-type'), body }
}

function stripScripts(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
}

function parseListSummary(html, teamCount) {
  const match = html.match(/"total":(\d+),"submitted":(\d+)/)
  if (match) {
    return { total: Number(match[1]), submitted: Number(match[2]) }
  }
  return { total: teamCount, submitted: null }
}

function parseTeamCard(cardHtml) {
  const nameMatch = cardHtml.match(/<h3[^>]*>([^<]+)<\/h3>/i)
  const idMatch = cardHtml.match(/\/events\/[^/]+\/teams\/(cmp[a-z0-9]+)/i)
  const trackMatch =
    cardHtml.match(/style="background-color:(#[0-9a-f]{3,8})/i) ||
    cardHtml.match(/background-color:(#[0-9a-f]{3,8})/i)

  const submitted = />Enviado<|>Submitted</i.test(cardHtml)
  const registered = />Registrado<|>Registered</i.test(cardHtml)

  return {
    id: idMatch?.[1] ?? null,
    name: nameMatch?.[1]?.trim() ?? null,
    status: submitted ? 'submitted' : registered ? 'registered' : 'unknown',
    trackColor: trackMatch?.[1] ?? null,
  }
}

function parseTeamsFromListHtml(html) {
  const visible = stripScripts(html)
  const parts = visible.split(CARD_SPLIT).slice(1)
  return parts.map((part) => parseTeamCard(part)).filter((t) => t.name)
}

function parseTeamScoreHtml(html) {
  const scoreBlock = html.match(
    /<h2[^>]*>\s*Score\s*<\/h2>[\s\S]*?<span class="text-4xl font-semibold[^>]*>([0-9.]+)<\/span>\s*<span[^>]*>\/\s*([0-9.]+)<\/span>/i,
  )
  const judgesMatch = html.match(/Averaged across (\d+) judges/i)

  if (!scoreBlock) {
    return { score: null, maxScore: null, judgesCount: judgesMatch ? Number(judgesMatch[1]) : null }
  }

  return {
    score: Number(scoreBlock[1]),
    maxScore: Number(scoreBlock[2]),
    judgesCount: judgesMatch ? Number(judgesMatch[1]) : null,
  }
}

async function fetchTeamScore({ eventId, teamId, cookie, baseUrl }) {
  const { status, body } = await fetchHackadmin(`/events/${eventId}/teams/${teamId}`, {
    cookie,
    baseUrl,
  })
  if (status !== 200) {
    return { score: null, maxScore: null, judgesCount: null, detailStatus: status }
  }
  return { ...parseTeamScoreHtml(body), detailStatus: status }
}

export async function getTeamsWithScores({
  eventId = 'evt_1',
  track,
  includeScores = true,
  baseUrl = DEFAULT_BASE,
}) {
  const cookie = getSessionCookie()
  const query = track ? `?track=${encodeURIComponent(track)}` : ''
  const listPath = `/events/${eventId}/teams${query}`

  const listResponse = await fetchHackadmin(listPath, { cookie, baseUrl })
  if (listResponse.status !== 200) {
    throw new Error(`Hackadmin respondió ${listResponse.status} al listar equipos`)
  }

  const teams = parseTeamsFromListHtml(listResponse.body)
  const summary = parseListSummary(listResponse.body, teams.length)

  if (!includeScores) {
    return {
      source: listResponse.url,
      eventId,
      track: track ?? null,
      summary,
      teams: teams.map((t, index) => ({ ...t, rank: index + 1 })),
    }
  }

  const enriched = await Promise.all(
    teams.map(async (team) => {
      if (!team.id) {
        return { ...team, score: null, maxScore: null, judgesCount: null, detailStatus: null }
      }
      const scoreData = await fetchTeamScore({ eventId, teamId: team.id, cookie, baseUrl })
      return { ...team, ...scoreData }
    }),
  )

  const ranked = [...enriched].sort((a, b) => {
    if (a.score == null && b.score == null) return a.name.localeCompare(b.name)
    if (a.score == null) return 1
    if (b.score == null) return -1
    return b.score - a.score
  })

  return {
    source: listResponse.url,
    eventId,
    track: track ?? null,
    summary,
    teams: ranked.map((team, index) => ({
      ...team,
      rank: team.score != null ? index + 1 : null,
    })),
    scoredCount: ranked.filter((t) => t.score != null).length,
  }
}
