import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  CRM_FULL_STEP,
  CRM_HUB,
  CRM_PIECES,
  type CrmPiece,
} from './crmPuzzleData'

const RING_RADIUS = 2.75
const STEP_MS = 3200

type Step =
  | { kind: 'intro' }
  | { kind: 'piece'; index: number }
  | { kind: 'full' }

const FLOW_STEPS: Step[] = [
  { kind: 'intro' },
  ...CRM_PIECES.map((_, index) => ({ kind: 'piece' as const, index })),
  { kind: 'full' },
]

function slotPosition(angle: number, radius: number) {
  return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
}

function stepCaption(step: Step) {
  if (step.kind === 'intro') {
    return {
      title: 'El círculo empieza en Tracto',
      plain: 'Cada CRM es una pieza que se añade sin romper lo que el banco ya tiene montado.',
    }
  }
  if (step.kind === 'piece') {
    const piece = CRM_PIECES[step.index]
    return { title: piece.name, plain: piece.plain }
  }
  return { title: CRM_FULL_STEP.title, plain: CRM_FULL_STEP.plain }
}

function labelLines(name: string): string[] {
  if (name === 'Microsoft Dynamics 365') return ['Microsoft', 'Dynamics 365']
  return [name]
}

function createLabelTexture(lines: string[], accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const multi = lines.length > 1
  canvas.width = 640
  canvas.height = multi ? 200 : 140
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = 'rgba(8, 8, 8, 0.94)'
  ctx.beginPath()
  ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 14)
  ctx.fill()

  ctx.strokeStyle = accentColor
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (multi) {
    ctx.font = '600 34px Georgia, "Times New Roman", Times, serif'
    ctx.fillText(lines[0], canvas.width / 2, canvas.height / 2 - 28)
    ctx.font = 'bold 40px Georgia, "Times New Roman", Times, serif'
    ctx.fillText(lines[1], canvas.width / 2, canvas.height / 2 + 28)
  } else {
    ctx.font = 'bold 44px Georgia, "Times New Roman", Times, serif'
    ctx.fillText(lines[0], canvas.width / 2, canvas.height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function createLabelMesh(name: string, color: string): THREE.Mesh {
  const lines = labelLines(name)
  const texture = createLabelTexture(lines, color)
  const aspect = texture.image.width / texture.image.height
  const labelW = name === 'Microsoft Dynamics 365' ? 1.55 : 1.35
  const labelH = labelW / aspect
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW, labelH),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      toneMapped: false,
    }),
  )
  mesh.renderOrder = 10
  return mesh
}

function pieceProgress(step: Step, pieceIndex: number, elapsed: number): number {
  if (step.kind === 'full') return 1
  if (step.kind === 'intro') return 0
  if (step.kind === 'piece' && step.index > pieceIndex) return 1
  if (step.kind === 'piece' && step.index === pieceIndex) {
    return Math.min(elapsed / (STEP_MS * 0.75), 1)
  }
  return 0
}

export function CrmPuzzleCanvas({ active = true }: { active?: boolean }) {
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

    let frameId = 0
    let disposed = false
    let initialized = false
    let teardown: (() => void) | null = null
    let resizeHandler: (() => void) | null = null

    const boot = () => {
      if (disposed) return

      const width = mount.clientWidth
      const height = mount.clientHeight
      if (width < 32 || height < 32) return

      if (initialized) {
        resizeHandler?.()
        return
      }
      initialized = true

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x000000, 0.06)

      const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100)
      camera.position.set(0, 0, 10.2)
      camera.lookAt(0, 0, 0)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.45))
      const key = new THREE.PointLight(0x00d4ff, 2.4, 50)
      key.position.set(2, 2, 10)
      const fill = new THREE.PointLight(0x1e5eff, 1.5, 50)
      fill.position.set(-4, -2, 8)
      scene.add(key, fill)

      const hubColor = new THREE.Color(CRM_HUB.color)

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.05, 0.35, 48),
        new THREE.MeshStandardMaterial({
          color: 0x0a0a0a,
          emissive: hubColor,
          emissiveIntensity: 0.6,
          metalness: 0.65,
          roughness: 0.28,
        }),
      )
      hub.rotation.x = Math.PI / 2
      scene.add(hub)

      const hubLabel = createLabelMesh(CRM_HUB.name, CRM_HUB.color)
      hubLabel.position.set(0, 0, 0.28)
      scene.add(hubLabel)

      const hubGlow = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.08, 16, 64),
        new THREE.MeshBasicMaterial({ color: hubColor, transparent: true, opacity: 0.45 }),
      )
      scene.add(hubGlow)

      const puzzleRing = new THREE.Mesh(
        new THREE.TorusGeometry(RING_RADIUS, 0.11, 12, 64),
        new THREE.MeshBasicMaterial({
          color: 0x1e5eff,
          transparent: true,
          opacity: 0.2,
        }),
      )
      scene.add(puzzleRing)

      const slotMarkers: THREE.Mesh[] = []
      CRM_PIECES.forEach((crm) => {
        const pos = slotPosition(crm.angle, RING_RADIUS)
        const marker = new THREE.Mesh(
          new THREE.RingGeometry(0.38, 0.52, 32),
          new THREE.MeshBasicMaterial({
            color: crm.color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
          }),
        )
        marker.position.copy(pos)
        scene.add(marker)
        slotMarkers.push(marker)

        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, new THREE.Vector3(0, 0, 0)])
        scene.add(
          new THREE.Line(
            lineGeo,
            new THREE.LineBasicMaterial({
              color: crm.color,
              transparent: true,
              opacity: 0.15,
            }),
          ),
        )
      })

      type PieceState = {
        crm: CrmPiece
        mesh: THREE.Mesh
        material: THREE.MeshStandardMaterial
        glow: THREE.Mesh
        label: THREE.Mesh
        home: THREE.Vector3
        start: THREE.Vector3
      }

      const pieces: PieceState[] = CRM_PIECES.map((crm) => {
        const color = new THREE.Color(crm.color)
        const material = new THREE.MeshStandardMaterial({
          color: 0x141414,
          emissive: color,
          emissiveIntensity: 0.25,
          metalness: 0.5,
          roughness: 0.35,
        })
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.78, 0.32), material)
        const home = slotPosition(crm.angle, RING_RADIUS)
        const start = slotPosition(crm.angle, RING_RADIUS * 2.15)
        start.z = -1.2
        mesh.position.copy(home)
        mesh.rotation.z = crm.angle
        scene.add(mesh)

        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.92, 0.38),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }),
        )
        glow.position.copy(mesh.position)
        glow.rotation.z = crm.angle
        scene.add(glow)

        const label = createLabelMesh(crm.name, crm.color)
        label.position.copy(mesh.position)
        label.position.z = 0.28
        scene.add(label)

        return { crm, mesh, material, glow, label, home, start }
      })

      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
      )
      scene.add(particle)

      function applyStep(stepIdx: number, elapsed: number) {
        const current = FLOW_STEPS[stepIdx]
        pieces.forEach((p, i) => {
          const t = pieceProgress(current, i, elapsed)
          const color = new THREE.Color(p.crm.color)

          if (t >= 1 || current.kind === 'full') {
            p.material.emissive.copy(color)
            p.material.emissiveIntensity = current.kind === 'full' ? 0.85 : 0.65
            ;(p.glow.material as THREE.MeshBasicMaterial).opacity = current.kind === 'full' ? 0.35 : 0.2
          } else if (t > 0) {
            p.material.emissive.copy(color)
            p.material.emissiveIntensity = 0.35 + t * 0.45
            ;(p.glow.material as THREE.MeshBasicMaterial).opacity = t * 0.25
          } else {
            p.material.emissiveIntensity = 0.2
            ;(p.glow.material as THREE.MeshBasicMaterial).opacity = 0
          }

          ;(slotMarkers[i].material as THREE.MeshBasicMaterial).opacity = 0.12 + t * 0.35
        })

        const hubBoost = current.kind === 'full' ? 1 : current.kind === 'piece' ? 0.75 : 0.5
        ;(hub.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + hubBoost * 0.4
        ;(puzzleRing.material as THREE.MeshBasicMaterial).opacity =
          current.kind === 'full' ? 0.55 : 0.18 + (current.kind === 'piece' ? 0.12 : 0)
      }

      applyStep(stepIndexRef.current, 0)

      const clock = new THREE.Clock()

      function animate() {
        if (disposed) return
        frameId = requestAnimationFrame(animate)

        const delta = clock.getDelta()
        const t = clock.getElapsedTime()
        stepElapsedRef.current += delta * 1000

        if (stepElapsedRef.current >= STEP_MS) {
          stepElapsedRef.current = 0
          const next = (stepIndexRef.current + 1) % FLOW_STEPS.length
          stepIndexRef.current = next
          setStepIndex(next)
        }

        const current = FLOW_STEPS[stepIndexRef.current]
        const elapsed = stepElapsedRef.current
        applyStep(stepIndexRef.current, elapsed)

        pieces.forEach((p, i) => {
          const prog = pieceProgress(current, i, elapsed)
          const eased = 1 - Math.pow(1 - prog, 3)
          p.mesh.position.lerpVectors(p.start, p.home, eased)
          p.glow.position.copy(p.mesh.position)
          p.label.position.copy(p.mesh.position)
          p.label.position.z = 0.28
          const scale = 0.5 + eased * 0.5
          p.mesh.scale.set(scale, scale, scale)
          p.glow.scale.set(scale, scale, scale)
          p.label.scale.set(scale, scale, scale)
          const pulse = current.kind === 'piece' && current.index === i ? 1 + Math.sin(t * 7) * 0.05 : 1
          p.mesh.scale.multiplyScalar(pulse)
          p.label.scale.multiplyScalar(pulse)
          p.label.quaternion.copy(camera.quaternion)
        })

        hubLabel.quaternion.copy(camera.quaternion)

        if (current.kind === 'piece') {
          const p = pieces[current.index]
          const prog = pieceProgress(current, current.index, elapsed)
          particle.position.lerpVectors(p.home, new THREE.Vector3(0, 0, 0), prog)
        } else if (current.kind === 'full') {
          particle.position.set(Math.cos(t * 1.5) * 2, Math.sin(t * 1.5) * 2, 0.1)
        } else {
          particle.position.set(0, 0, 0.15)
        }

        hub.rotation.z = t * 0.2
        hubGlow.rotation.z = -t * 0.45
        puzzleRing.rotation.z = t * 0.06

        camera.position.x = Math.sin(t * 0.12) * 0.25
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      resizeHandler = () => {
        const w = mount.clientWidth
        const h = mount.clientHeight
        if (w < 32 || h < 32) return
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }

      resizeHandler()

      teardown = () => {
        cancelAnimationFrame(frameId)
        initialized = false
        resizeHandler = null
        renderer.dispose()
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement)
        }
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
            object.geometry.dispose()
            const { material } = object
            if (Array.isArray(material)) {
              material.forEach((m) => {
                if (m instanceof THREE.MeshBasicMaterial && m.map) m.map.dispose()
                m.dispose()
              })
            } else {
              if (material instanceof THREE.MeshBasicMaterial && material.map) {
                material.map.dispose()
              }
              material.dispose()
            }
          }
        })
      }
    }

    boot()
    const observer = new ResizeObserver(() => boot())
    observer.observe(mount)
    window.addEventListener('resize', boot)

    return () => {
      disposed = true
      observer.disconnect()
      window.removeEventListener('resize', boot)
      teardown?.()
      setStepIndex(0)
      stepIndexRef.current = 0
      stepElapsedRef.current = 0
    }
  }, [active])

  function legendClass(pieceId: string) {
    const pieceIndex = CRM_PIECES.findIndex((p) => p.id === pieceId)
    if (step.kind === 'full') return 'is-done'
    if (step.kind === 'piece' && pieceIndex < step.index) return 'is-done'
    if (step.kind === 'piece' && pieceIndex === step.index) return 'is-active'
    return undefined
  }

  return (
    <div className="pitchPipeline pitchPipeline--crm pitchPipeline--split">
      <div className="pitchPipeline__canvas pitchCrm__canvas" ref={mountRef} aria-hidden="true" />
      <aside className="pitchPipeline__aside">
        <div className="pitchPipeline__caption pitchCrm__caption" key={`${step.kind}-${stepIndex}`}>
          <p className="pitchPipeline__step">
            Paso {stepIndex + 1} de {FLOW_STEPS.length}
          </p>
          <h3 className="pitchPipeline__nodeTitle">{caption.title}</h3>
          <p className="pitchPipeline__nodePlain">{caption.plain}</p>
        </div>
        <ul className="pitchPipeline__legend pitchCrm__brands" aria-label="CRM conectados">
          {CRM_PIECES.map((piece) => (
            <li key={piece.id} className={legendClass(piece.id)}>
              <span
                className="pitchCrm__brandMark"
                style={{ backgroundColor: piece.color }}
                aria-hidden="true"
              >
                {piece.short}
              </span>
              <span className="pitchCrm__brandName">{piece.name}</span>
            </li>
          ))}
          <li
            className={
              step.kind === 'full' ? 'is-active' : step.kind !== 'intro' ? 'is-done' : undefined
            }
          >
            <span
              className="pitchCrm__brandMark pitchCrm__brandMark--hub"
              style={{ borderColor: CRM_HUB.color }}
              aria-hidden="true"
            >
              T
            </span>
            <span className="pitchCrm__brandName">{CRM_HUB.name}</span>
          </li>
        </ul>
      </aside>
    </div>
  )
}
