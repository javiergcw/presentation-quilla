import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  CONNECTOR_HUB,
  CONNECTOR_OUTCOMES,
  CONNECTOR_SOURCES,
  type ConnectorOutcome,
  type ConnectorSource,
} from './connectorFlowData'

const SOURCE_RADIUS = 3.35
const OUTCOME_Y = -2.55
const STEP_MS = 3200

type FlowStep =
  | { kind: 'source'; index: number }
  | { kind: 'hub' }
  | { kind: 'outcome'; index: number }
  | { kind: 'full' }

function buildSteps(): FlowStep[] {
  const steps: FlowStep[] = CONNECTOR_SOURCES.map((_, index) => ({
    kind: 'source',
    index,
  }))
  steps.push({ kind: 'hub' })
  CONNECTOR_OUTCOMES.forEach((_, index) => steps.push({ kind: 'outcome', index }))
  steps.push({ kind: 'full' })
  return steps
}

const FLOW_STEPS = buildSteps()

function sourcePosition(source: ConnectorSource) {
  return new THREE.Vector3(
    Math.cos(source.angle) * SOURCE_RADIUS,
    Math.sin(source.angle) * SOURCE_RADIUS,
    0,
  )
}

function outcomePosition(outcome: ConnectorOutcome) {
  return new THREE.Vector3(outcome.x, OUTCOME_Y, 0)
}

function stepCaption(step: FlowStep) {
  if (step.kind === 'source') {
    const source = CONNECTOR_SOURCES[step.index]
    return { title: source.title, plain: source.plain }
  }
  if (step.kind === 'hub') {
    return { title: CONNECTOR_HUB.title, plain: CONNECTOR_HUB.plain }
  }
  if (step.kind === 'outcome') {
    const outcome = CONNECTOR_OUTCOMES[step.index]
    return { title: outcome.title, plain: outcome.plain }
  }
  return {
    title: 'Ecosistema conectado',
    plain: 'Un solo flujo: datos existentes → inteligencia → visibilidad GEO → más clientes.',
  }
}

export function ConnectorsHubCanvas({ active = true }: { active?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const stepIndexRef = useRef(0)
  const stepElapsedRef = useRef(0)
  const step = FLOW_STEPS[stepIndex] ?? FLOW_STEPS[0]
  const caption = stepCaption(step)

  useEffect(() => {
    stepIndexRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !active) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.065)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0.15, 10.5)
    camera.lookAt(0, -0.35, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.32))
    const key = new THREE.PointLight(0x00d4ff, 2.4, 40)
    key.position.set(0, 2, 8)
    const fill = new THREE.PointLight(0x1e5eff, 1.6, 40)
    fill.position.set(-5, -3, 6)
    scene.add(key, fill)

    const hubPos = new THREE.Vector3(0, -0.15, 0)
    const hubColor = new THREE.Color(CONNECTOR_HUB.color)

    const hubCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.55, 1),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        emissive: hubColor,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.25,
      }),
    )
    hubCore.position.copy(hubPos)
    scene.add(hubCore)

    const hubRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.06, 12, 48),
      new THREE.MeshBasicMaterial({ color: hubColor, transparent: true, opacity: 0.35 }),
    )
    hubRing.position.copy(hubPos)
    scene.add(hubRing)

    const sourceMeshes = new Map<string, THREE.Mesh>()
    const sourceMaterials = new Map<string, THREE.MeshStandardMaterial>()
    const sourceGlows = new Map<string, THREE.MeshBasicMaterial>()
    const sourcePositions = new Map<string, THREE.Vector3>()

    CONNECTOR_SOURCES.forEach((source) => {
      const pos = sourcePosition(source)
      sourcePositions.set(source.id, pos)
      const color = new THREE.Color(source.color)

      const material = new THREE.MeshStandardMaterial({
        color: 0x101010,
        emissive: color,
        emissiveIntensity: 0.18,
        metalness: 0.5,
        roughness: 0.4,
      })
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.58, 0.22), material)
      mesh.position.copy(pos)
      mesh.lookAt(hubPos)
      scene.add(mesh)
      sourceMeshes.set(source.id, mesh)
      sourceMaterials.set(source.id, material)

      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
      })
      const glow = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.7, 0.3), glowMat)
      glow.position.copy(pos)
      glow.lookAt(hubPos)
      scene.add(glow)
      sourceGlows.set(source.id, glowMat)

      const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, hubPos])
      scene.add(
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: source.color,
            transparent: true,
            opacity: 0.15,
          }),
        ),
      )
    })

    const outcomeMeshes = new Map<string, THREE.Mesh>()
    const outcomeMaterials = new Map<string, THREE.MeshStandardMaterial>()
    const outcomePositions = new Map<string, THREE.Vector3>()

    CONNECTOR_OUTCOMES.forEach((outcome) => {
      const pos = outcomePosition(outcome)
      outcomePositions.set(outcome.id, pos)
      const color = new THREE.Color(outcome.color)

      const material = new THREE.MeshStandardMaterial({
        color: 0x101010,
        emissive: color,
        emissiveIntensity: 0.12,
        metalness: 0.45,
        roughness: 0.42,
      })
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 6), material)
      mesh.rotation.x = Math.PI / 2
      mesh.position.copy(pos)
      scene.add(mesh)
      outcomeMeshes.set(outcome.id, mesh)
      outcomeMaterials.set(outcome.id, material)

      const lineGeo = new THREE.BufferGeometry().setFromPoints([hubPos, pos])
      scene.add(
        new THREE.Line(
          lineGeo,
          new THREE.LineBasicMaterial({
            color: outcome.color,
            transparent: true,
            opacity: 0.12,
          }),
        ),
      )
    })

    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
    )
    scene.add(particle)

    const particleTrail = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.28 }),
    )
    scene.add(particleTrail)

    function setSourceState(id: string, state: 'idle' | 'active' | 'done') {
      const mat = sourceMaterials.get(id)
      const glow = sourceGlows.get(id)
      const source = CONNECTOR_SOURCES.find((s) => s.id === id)
      if (!mat || !glow || !source) return
      const color = new THREE.Color(source.color)
      if (state === 'active') {
        mat.emissive.copy(color)
        mat.emissiveIntensity = 0.9
        glow.opacity = 0.32
      } else if (state === 'done') {
        mat.emissive.copy(color)
        mat.emissiveIntensity = 0.4
        glow.opacity = 0.1
      } else {
        mat.emissiveIntensity = 0.15
        glow.opacity = 0
      }
    }

    function setOutcomeState(id: string, state: 'idle' | 'active' | 'done') {
      const mat = outcomeMaterials.get(id)
      const outcome = CONNECTOR_OUTCOMES.find((o) => o.id === id)
      if (!mat || !outcome) return
      const color = new THREE.Color(outcome.color)
      if (state === 'active') mat.emissiveIntensity = 0.95
      else if (state === 'done') mat.emissiveIntensity = 0.45
      else mat.emissiveIntensity = 0.12
      mat.emissive.copy(color)
    }

    function applyStepVisuals(flowStep: FlowStep) {
      CONNECTOR_SOURCES.forEach((s, i) => {
        if (flowStep.kind === 'full') setSourceState(s.id, 'done')
        else if (flowStep.kind === 'source' && i < flowStep.index) setSourceState(s.id, 'done')
        else if (flowStep.kind === 'source' && i === flowStep.index) setSourceState(s.id, 'active')
        else if (flowStep.kind === 'hub' || flowStep.kind === 'outcome') {
          setSourceState(s.id, 'done')
        } else setSourceState(s.id, 'idle')
      })

      CONNECTOR_OUTCOMES.forEach((o, i) => {
        if (flowStep.kind === 'full' || (flowStep.kind === 'outcome' && i < flowStep.index)) {
          setOutcomeState(o.id, 'done')
        } else if (flowStep.kind === 'outcome' && i === flowStep.index) {
          setOutcomeState(o.id, 'active')
        } else {
          setOutcomeState(o.id, 'idle')
        }
      })

      const hubIntensity =
        flowStep.kind === 'hub' || flowStep.kind === 'outcome' || flowStep.kind === 'full'
          ? 0.95
          : 0.45
      ;(hubCore.material as THREE.MeshStandardMaterial).emissiveIntensity = hubIntensity
    }

    applyStepVisuals(FLOW_STEPS[0])

    function particlePath(flowStep: FlowStep, progress: number): THREE.Vector3 {
      const eased = 1 - Math.pow(1 - Math.min(progress, 1), 3)

      if (flowStep.kind === 'source') {
        const from = sourcePositions.get(CONNECTOR_SOURCES[flowStep.index].id)!
        return from.clone().lerp(hubPos, eased)
      }
      if (flowStep.kind === 'hub') {
        return hubPos.clone()
      }
      if (flowStep.kind === 'outcome') {
        const to = outcomePositions.get(CONNECTOR_OUTCOMES[flowStep.index].id)!
        return hubPos.clone().lerp(to, eased)
      }
      const orbit = (stepElapsedRef.current / STEP_MS) * Math.PI * 2
      return new THREE.Vector3(Math.cos(orbit) * 1.2, Math.sin(orbit) * 0.8 - 0.15, 0)
    }

    const clock = new THREE.Clock()
    let frameId = 0
    const container = mount

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      stepElapsedRef.current += clock.getDelta() * 1000

      if (stepElapsedRef.current >= STEP_MS) {
        stepElapsedRef.current = 0
        const next = (stepIndexRef.current + 1) % FLOW_STEPS.length
        stepIndexRef.current = next
        setStepIndex(next)
        applyStepVisuals(FLOW_STEPS[next])
      }

      const flowStep = FLOW_STEPS[stepIndexRef.current]
      const progress = stepElapsedRef.current / STEP_MS
      const pos = particlePath(flowStep, progress)
      particle.position.copy(pos)
      particleTrail.position.copy(pos)

      hubCore.rotation.y = t * 0.55
      hubCore.rotation.x = Math.sin(t * 0.4) * 0.12
      hubRing.rotation.z = -t * 0.85

      sourceMeshes.forEach((mesh, id) => {
        const index = CONNECTOR_SOURCES.findIndex((s) => s.id === id)
        const isActive =
          flowStep.kind === 'source' && flowStep.index === index
        const scale = isActive ? 1 + Math.sin(t * 6) * 0.05 : 1
        mesh.scale.set(scale, scale, scale)
      })

      outcomeMeshes.forEach((mesh, id) => {
        const index = CONNECTOR_OUTCOMES.findIndex((o) => o.id === id)
        const isActive =
          flowStep.kind === 'outcome' && flowStep.index === index
        mesh.position.y = OUTCOME_Y + (isActive ? Math.sin(t * 5) * 0.06 : 0)
      })

      particleTrail.scale.setScalar(1 + Math.sin(t * 9) * 0.12)
      camera.position.x = Math.sin(t * 0.12) * 0.35
      camera.lookAt(0, -0.35, 0)

      renderer.render(scene, camera)
    }

    animate()

    function handleResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose()
          const { material } = object
          if (Array.isArray(material)) material.forEach((m) => m.dispose())
          else material.dispose()
        }
      })
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    setStepIndex(0)
    stepIndexRef.current = 0
    stepElapsedRef.current = 0
  }, [active])

  const legendItems = [
    ...CONNECTOR_SOURCES.map((s) => ({ id: s.id, title: s.title, color: s.color })),
    { id: CONNECTOR_HUB.id, title: 'Tracto', color: CONNECTOR_HUB.color },
    ...CONNECTOR_OUTCOMES.map((o) => ({ id: o.id, title: o.title, color: o.color })),
  ]

  function legendClass(itemId: string) {
    if (step.kind === 'source' && CONNECTOR_SOURCES[step.index]?.id === itemId) return 'is-active'
    if (step.kind === 'hub' && itemId === CONNECTOR_HUB.id) return 'is-active'
    if (step.kind === 'outcome' && CONNECTOR_OUTCOMES[step.index]?.id === itemId) return 'is-active'
    if (step.kind === 'full') return 'is-done'

    const sourceIdx = CONNECTOR_SOURCES.findIndex((s) => s.id === itemId)
    if (sourceIdx >= 0) {
      if (step.kind === 'hub' || step.kind === 'outcome') return 'is-done'
      if (step.kind === 'source' && sourceIdx < step.index) return 'is-done'
    }

    const outcomeIdx = CONNECTOR_OUTCOMES.findIndex((o) => o.id === itemId)
    if (outcomeIdx >= 0) {
      if (step.kind === 'outcome' && outcomeIdx < step.index) return 'is-done'
    }

    if (itemId === CONNECTOR_HUB.id) {
      if (step.kind === 'outcome') return 'is-done'
    }

    return undefined
  }

  return (
    <div className="pitchPipeline pitchPipeline--connectors">
      <div className="pitchPipeline__canvas" ref={mountRef} aria-hidden="true" />
      <div className="pitchPipeline__caption" key={`${step.kind}-${stepIndex}`}>
        <p className="pitchPipeline__step">
          Paso {stepIndex + 1} de {FLOW_STEPS.length}
        </p>
        <h3 className="pitchPipeline__nodeTitle">{caption.title}</h3>
        <p className="pitchPipeline__nodePlain">{caption.plain}</p>
      </div>
      <ul className="pitchPipeline__legend" aria-label="Sistemas conectados">
        {legendItems.map((item) => (
          <li key={item.id} className={legendClass(item.id)}>
            <span className="pitchPipeline__dot" style={{ backgroundColor: item.color }} />
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
