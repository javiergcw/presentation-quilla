export type HackadminTeam = {
  id: string | null
  name: string
  status: string
  score: number | null
  maxScore: number | null
  judgesCount: number | null
  rank: number | null
}

export type HackadminTeamsResponse = {
  fetchedAt: string
  eventId: string
  track: string | null
  summary: { total: number; submitted: number | null } | null
  scoredCount: number
  teams: HackadminTeam[]
}

const DEFAULT_TRACK = 'cmpg2rsro0001nhcj0s60ukla'
const DEFAULT_EVENT = 'evt_1'

export async function fetchHackadminTeams(
  track = DEFAULT_TRACK,
  eventId = DEFAULT_EVENT,
): Promise<HackadminTeamsResponse> {
  const params = new URLSearchParams({ track, eventId })
  const response = await fetch(`/api/hackadmin/teams?${params}`)

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Error ${response.status} al consultar equipos`)
  }

  return response.json() as Promise<HackadminTeamsResponse>
}

export function getTopTeams(teams: HackadminTeam[], limit = 10): HackadminTeam[] {
  return [...teams]
    .filter((team) => team.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)
    .map((team, index) => ({ ...team, rank: index + 1 }))
}

export function formatJudgesLabel(count: number | null): string {
  if (count == null) return '—'
  if (count === 0) return '0 jurados'
  return count === 1 ? '1 jurado' : `${count} jurados`
}
