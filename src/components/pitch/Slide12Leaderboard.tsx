import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TractoPitchLayout } from './TractoPitchLayout'
import { PITCH_TOTAL } from './pitchConfig'
import {
  fetchHackadminTeams,
  formatJudgesLabel,
  getTopTeams,
  type HackadminTeam,
  type HackadminTeamsResponse,
} from '../../api/hackadmin'

const easeOut = [0.22, 1, 0.36, 1] as const

export function Slide12Leaderboard() {
  const [data, setData] = useState<HackadminTeamsResponse | null>(null)
  const [top10, setTop10] = useState<HackadminTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchHackadminTeams()
        if (cancelled) return
        setData(response)
        setTop10(getTopTeams(response.teams, 10))
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'No se pudo cargar el ranking')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TractoPitchLayout slide={11} total={PITCH_TOTAL} className="pitchSlide--leaderboard">
      <div className="pitchLeaderboard">
        <motion.header
          className="pitchLeaderboard__header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
        >
          <p className="pitchEyebrow">Track Fintech · Barranqui-IA 2026</p>
          <h2 className="pitchLeaderboard__title">Top 10 equipos</h2>
          {data ? (
            <p className="pitchLeaderboard__meta">
              {data.scoredCount} con puntaje de jueces
              {data.summary ? ` · ${data.summary.total} equipos en el track` : ''}
            </p>
          ) : null}
        </motion.header>

        {loading ? (
          <p className="pitchLeaderboard__status">Cargando ranking desde Hackadmin…</p>
        ) : null}

        {error ? (
          <div className="pitchLeaderboard__error" role="alert">
            <p>{error}</p>
            <p className="pitchLeaderboard__hint">
              Ejecuta en otra terminal: <code>cd presentation && npm run api</code>
            </p>
          </div>
        ) : null}

        {!loading && !error && top10.length > 0 ? (
          <>
            <div className="pitchLeaderboard__columns" aria-hidden>
              <span className="pitchLeaderboard__colRank">#</span>
              <span className="pitchLeaderboard__colTeam">Equipo</span>
              <span className="pitchLeaderboard__colJudges">Jurados</span>
              <span className="pitchLeaderboard__colScore">Puntaje</span>
            </div>
            <motion.ol
              className="pitchLeaderboard__list"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
            >
              {top10.map((team) => (
                <motion.li
                  key={team.id ?? team.name}
                  className={`pitchLeaderboard__row pitchLeaderboard__row--place-${team.rank ?? 0}`}
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  <span className="pitchLeaderboard__rank">{team.rank}</span>
                  <div className="pitchLeaderboard__info">
                    <span className="pitchLeaderboard__name">{team.name}</span>
                  </div>
                  <span
                    className="pitchLeaderboard__judges"
                    title="Jurados que votaron (promedio en Hackadmin)"
                  >
                    {formatJudgesLabel(team.judgesCount)}
                  </span>
                  <div className="pitchLeaderboard__scoreWrap">
                    <span className="pitchLeaderboard__score">{team.score?.toFixed(1)}</span>
                    <span className="pitchLeaderboard__max">/ {team.maxScore ?? 5}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </>
        ) : null}

        {!loading && !error && top10.length === 0 ? (
          <p className="pitchLeaderboard__status">Aún no hay equipos con puntaje publicado.</p>
        ) : null}
      </div>
    </TractoPitchLayout>
  )
}
