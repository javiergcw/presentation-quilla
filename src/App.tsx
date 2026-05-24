import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Slide01Question } from './components/pitch/Slide01Question'
import { Slide02Stat } from './components/pitch/Slide02Stat'
import { Slide03VisibilityGap } from './components/pitch/Slide03VisibilityGap'
import { Slide05Tracto } from './components/pitch/Slide05Tracto'
import { Slide08Chatbot } from './components/pitch/Slide08Chatbot'
import { Slide09AdvisorPanel } from './components/pitch/Slide09AdvisorPanel'
import { Slide10RagAdmin } from './components/pitch/Slide10RagAdmin'
import { Slide11CoordAdmin } from './components/pitch/Slide11CoordAdmin'
import { Slide11FaqMindMap } from './components/pitch/Slide11FaqMindMap'
import { Slide13NightAutomation } from './components/pitch/Slide13NightAutomation'
import { Slide14MarketingWordPress } from './components/pitch/Slide14MarketingWordPress'
import { Slide07WordPressDraft } from './components/pitch/Slide07WordPressDraft'
import { Slide12CrmPuzzle } from './components/pitch/Slide12CrmPuzzle'

type Slide = {
  id: string
  body: ReactNode
}

function App() {
  const [index, setIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const slides: Slide[] = useMemo(
    () => [
      { id: 'pitch-01-question', body: <Slide01Question /> },
      { id: 'pitch-02-stat', body: <Slide02Stat /> },
      { id: 'pitch-03-gap', body: <Slide03VisibilityGap /> },
      { id: 'pitch-04-tracto', body: <Slide05Tracto /> },
      { id: 'pitch-05-night-flow', body: <Slide13NightAutomation /> },
      { id: 'pitch-06-marketing-wp', body: <Slide14MarketingWordPress /> },
      { id: 'pitch-07-wordpress-draft', body: <Slide07WordPressDraft /> },
      { id: 'pitch-08-chatbot', body: <Slide08Chatbot /> },
      { id: 'pitch-09-advisor', body: <Slide09AdvisorPanel /> },
      { id: 'pitch-10-rag', body: <Slide10RagAdmin /> },
      { id: 'pitch-11-faq-mindmap', body: <Slide11FaqMindMap /> },
      { id: 'pitch-12-admin', body: <Slide11CoordAdmin /> },
      { id: 'pitch-13-crm-puzzle', body: <Slide12CrmPuzzle /> },
    ],
    [],
  )

  const current = slides[index]

  const previous = useCallback(() => {
    setIndex((value) => Math.max(0, value - 1))
  }, [])

  const next = useCallback(() => {
    setIndex((value) => Math.min(slides.length - 1, value + 1))
  }, [slides.length])

  const enterFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previous()
      }
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [next, previous])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    handleFullscreenChange()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    document.body.classList.add('deck--pitch')
    return () => document.body.classList.remove('deck--pitch')
  }, [])

  return (
    <main className="deck deck--pitch">
      <AnimatePresence mode="wait">
        <motion.section
          className="slide slide--full"
          aria-live="polite"
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {current.body}
        </motion.section>
      </AnimatePresence>

      {!isFullscreen ? (
        <button type="button" className="pitchFullscreen" onClick={enterFullscreen}>
          Presentar
        </button>
      ) : null}

      <nav className="slideNav" aria-label="Navegacion de slides">
        <button type="button" onClick={previous} disabled={index === 0}>
          Anterior
        </button>
        <span>
          {index + 1} / {slides.length}
        </span>
        <button type="button" onClick={next} disabled={index === slides.length - 1}>
          Siguiente
        </button>
      </nav>
    </main>
  )
}

export default App
