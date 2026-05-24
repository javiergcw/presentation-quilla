import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { PipelineFlow, PipelineNode } from './n8nFlowData'

const COL_SPACING_DEFAULT = 2.35
const ROW_SPACING_DEFAULT = 1.55
const STEP_MS = 2800

type N8nPipelineCanvasProps = {
  flow: PipelineFlow
  active?: boolean
  large?: boolean
}

function nodePosition(
  node: PipelineNode,
  cols: number,
  colSpacing: number,
  rowSpacing: number,
) {
  const offsetX = ((cols - 1) * colSpacing) / 2
  return new THREE.Vector3(
    node.col * colSpacing - offsetX,
    -node.row * rowSpacing + rowSpacing * 0.35,
    0,
  )
}

export function N8nPipelineCanvas({ flow, active = true, large = false }: N8nPipelineCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const stepIndexRef = useRef(0)
  const stepElapsedRef = useRef(0)
  const currentNode = flow.nodes[stepIndex] ?? flow.nodes[0]

  useEffect(() => {
    stepIndexRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !active) return

    const width = mount.clientWidth
    const height = mount.clientHeight
    const cols = Math.max(...flow.nodes.map((n) => n.col)) + 1
    const colSpacing = large ? 2.55 : COL_SPACING_DEFAULT
    const rowSpacing = large ? 1.72 : ROW_SPACING_DEFAULT

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.08)

    const camera = new THREE.PerspectiveCamera(large ? 48 : 42, width / height, 0.1, 100)
    camera.position.set(0, 0.2, large ? 10.8 : 9.2)
    camera.lookAt(0, -0.1, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.PointLight(0x00d4ff, 2.2, 30)
    key.position.set(2, 3, 6)
    const fill = new THREE.PointLight(0x1e5eff, 1.4, 30)
    fill.position.set(-4, -2, 5)
    scene.add(key, fill)

    const positions = new Map<string, THREE.Vector3>()
    flow.nodes.forEach((node) =>
      positions.set(node.id, nodePosition(node, cols, colSpacing, rowSpacing)),
    )

    const nodeMeshes = new Map<string, THREE.Mesh>()
    const nodeMaterials = new Map<string, THREE.MeshStandardMaterial>()
    const glowMaterials = new Map<string, THREE.MeshBasicMaterial>()

    flow.nodes.forEach((node) => {
      const pos = positions.get(node.id)!
      const color = new THREE.Color(node.color)

      const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: color,
        emissiveIntensity: 0.15,
        metalness: 0.55,
        roughness: 0.35,
      })
      const boxW = large ? 1.22 : 1.05
      const boxH = large ? 0.72 : 0.62
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, 0.28), material)
      mesh.position.copy(pos)
      scene.add(mesh)
      nodeMeshes.set(node.id, mesh)
      nodeMaterials.set(node.id, material)

      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
      })
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(boxW * 1.12, boxH * 1.15, 0.38),
        glowMat,
      )
      glow.position.copy(pos)
      scene.add(glow)
      glowMaterials.set(node.id, glowMat)
    })

    const edgeMaterials: THREE.LineBasicMaterial[] = []

    flow.edges.forEach(([from, to]) => {
      const start = positions.get(from)!
      const end = positions.get(to)!
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
      const material = new THREE.LineBasicMaterial({
        color: 0x1e5eff,
        transparent: true,
        opacity: 0.22,
      })
      scene.add(new THREE.Line(geometry, material))
      edgeMaterials.push(material)
    })

    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
    )
    scene.add(particle)

    const particleGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.35 }),
    )
    scene.add(particleGlow)

    function setNodeVisualState(nodeId: string, state: 'idle' | 'active' | 'done') {
      const material = nodeMaterials.get(nodeId)
      const glowMat = glowMaterials.get(nodeId)
      const node = flow.nodes.find((n) => n.id === nodeId)
      if (!material || !glowMat || !node) return

      const color = new THREE.Color(node.color)
      if (state === 'active') {
        material.emissive.copy(color)
        material.emissiveIntensity = 0.95
        glowMat.opacity = 0.28
      } else if (state === 'done') {
        material.emissive.copy(color)
        material.emissiveIntensity = 0.35
        glowMat.opacity = 0.08
      } else {
        material.emissiveIntensity = 0.12
        glowMat.opacity = 0
      }
    }

    function updateFlowVisuals(step: number) {
      flow.nodes.forEach((node, index) => {
        if (index < step) setNodeVisualState(node.id, 'done')
        else if (index === step) setNodeVisualState(node.id, 'active')
        else setNodeVisualState(node.id, 'idle')
      })

      flow.edges.forEach(([from], edgeIndex) => {
        const fromIndex = flow.nodes.findIndex((n) => n.id === from)
        const material = edgeMaterials[edgeIndex]
        if (!material) return
        material.opacity = fromIndex < step ? 0.75 : fromIndex === step ? 0.45 : 0.18
        material.color.setHex(fromIndex <= step ? 0x00d4ff : 0x1e5eff)
      })
    }

    updateFlowVisuals(0)

    const clock = new THREE.Clock()
    let frameId = 0

    function animate() {
      frameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      stepElapsedRef.current += delta * 1000

      if (stepElapsedRef.current >= STEP_MS) {
        stepElapsedRef.current = 0
        const next = (stepIndexRef.current + 1) % flow.nodes.length
        stepIndexRef.current = next
        setStepIndex(next)
        updateFlowVisuals(next)
      }

      const t = clock.getElapsedTime()
      const step = stepIndexRef.current
      const current = flow.nodes[step]
      const prev = flow.nodes[Math.max(0, step - 1)]
      const fromPos = positions.get(prev.id)!
      const toPos = positions.get(current.id)!
      const progress = Math.min(stepElapsedRef.current / STEP_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      if (step > 0) {
        particle.position.lerpVectors(fromPos, toPos, eased)
      } else {
        particle.position.copy(toPos)
      }
      particleGlow.position.copy(particle.position)

      nodeMeshes.forEach((mesh, id) => {
        const index = flow.nodes.findIndex((n) => n.id === id)
        const pulse = index === step ? 1 + Math.sin(t * 5) * 0.04 : 1
        mesh.scale.set(pulse, pulse, pulse)
        mesh.rotation.y = Math.sin(t * 0.6 + index) * 0.04
      })

      particleGlow.scale.setScalar(1 + Math.sin(t * 8) * 0.15)
      camera.position.x = Math.sin(t * 0.15) * 0.25
      camera.lookAt(0, -0.1, 0)

      renderer.render(scene, camera)
    }

    animate()

    const container = mount

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
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const { material } = object
          if (Array.isArray(material)) material.forEach((m) => m.dispose())
          else material.dispose()
        }
        if (object instanceof THREE.Line) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) object.material.dispose()
        }
      })
    }
  }, [active, flow, large])

  useEffect(() => {
    if (!active) return
    setStepIndex(0)
    stepIndexRef.current = 0
    stepElapsedRef.current = 0
  }, [active, flow.id])

  return (
    <div className={`pitchPipeline${large ? ' pitchPipeline--split' : ''}`}>
      <div className="pitchPipeline__canvas" ref={mountRef} aria-hidden="true" />
      <aside className="pitchPipeline__aside">
        <div className="pitchPipeline__caption pitchPipeline__caption--side" key={currentNode.id}>
          <p className="pitchPipeline__step">
            Paso {stepIndex + 1} de {flow.nodes.length}
          </p>
          <h3 className="pitchPipeline__nodeTitle">{currentNode.title}</h3>
          <p className="pitchPipeline__nodePlain">{currentNode.plain}</p>
        </div>
        <ul className="pitchPipeline__legend" aria-label="Pasos del flujo">
          {flow.nodes.map((node, index) => (
            <li
              key={node.id}
              className={
                index < stepIndex ? 'is-done' : index === stepIndex ? 'is-active' : undefined
              }
            >
              <span className="pitchPipeline__dot" style={{ backgroundColor: node.color }} />
              {node.title}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
