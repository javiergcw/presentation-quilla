import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  FAQ_NOTIFICATIONS,
  FAQ_QUESTION_INTERVAL_MS,
  FAQ_RANKED_PRODUCTS,
  FAQ_STANDARD_QUESTIONS,
} from './faqMindMapData'

/** Columnas: Cliente móvil (izq) → Chatbot (centro) → FAQ (der, dominante) */
const ZONE = {
  client: new THREE.Vector3(-2.5, -0.08, 0),
  chatbot: new THREE.Vector3(0, 0.1, 0),
  faq: new THREE.Vector3(2.65, 0, 0),
} as const

const FAQ_BOARD_W = 3.15
const FAQ_BOARD_H = 3.75

const MAX_VISIBLE_QUESTIONS = 5
const ROW_HEIGHT = 0.46
const LIST_TOP_Y = 0.48
const POP_DURATION = 0.55

/** Escalas de etiquetas 3D (mundo) */
const LABEL_SCALE = {
  header: 1.0,
  question: 0.56,
  chatTag: 0.5,
  phoneTitle: 0.48,
  notif: 0.4,
  rank: 0.32,
} as const

const CHATBOT_RADIUS = 0.82

function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function metallicMaterial(color: string, intensity = 0.45) {
  return new THREE.MeshStandardMaterial({
    color: 0x101010,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    metalness: 0.85,
    roughness: 0.2,
  })
}

function makeTexture(
  lines: string[],
  accent: string,
  opts: { w?: number; h?: number; sub?: string; rank?: number; index?: number } = {},
) {
  const w = opts.w ?? 640
  const h = opts.h ?? 88
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = 'rgba(8, 10, 16, 0.94)'
  ctx.beginPath()
  ctx.roundRect(8, 8, w - 16, h - 16, 12)
  ctx.fill()
  ctx.strokeStyle = accent
  ctx.lineWidth = opts.index === 0 ? 5 : 3
  ctx.stroke()

  if (opts.index != null) {
    ctx.fillStyle = accent
    ctx.globalAlpha = 0.25
    ctx.fillRect(12, 12, 58, h - 24)
    ctx.globalAlpha = 1
    ctx.fillStyle = accent
    ctx.font = 'bold 24px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(opts.index).padStart(2, '0'), 40, h / 2 + 8)
  }

  if (opts.rank != null) {
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(42, h / 2, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = 'bold 28px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(opts.rank), 48, h / 2 + 10)
  }

  ctx.fillStyle = '#f4f7ff'
  ctx.font = '600 26px Georgia, "Times New Roman", serif'
  const tx = opts.rank != null ? 88 : opts.index != null ? 82 : w / 2
  const line = lines[0].length > 38 ? lines[0].slice(0, 36) + '…' : lines[0]
  ctx.textAlign = opts.rank != null || opts.index != null ? 'left' : 'center'
  ctx.fillText(line, tx, opts.sub ? h / 2 - 12 : h / 2 + 6)

  if (opts.sub) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '600 22px Georgia, serif'
    ctx.fillText(opts.sub, tx, h / 2 + 22)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  return tex
}

function makeCounterHeaderTexture(counter: string) {
  const w = 200
  const h = 200
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = 'rgba(6, 10, 18, 0.95)'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, 78, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#00d4ff'
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.fillStyle = '#f4f7ff'
  ctx.font = 'bold 34px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(counter, w / 2, h / 2 + 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  return tex
}

function labelFromTexture(tex: THREE.CanvasTexture, scale = 0.5) {
  const aspect = tex.image.width / tex.image.height
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(scale * aspect, scale),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }),
  )
  mesh.renderOrder = 15
  return mesh
}

function makeLabel(
  text: string,
  accent: string,
  scale = 0.5,
  extra?: { sub?: string; rank?: number; w?: number; index?: number },
) {
  return labelFromTexture(makeTexture([text], accent, extra), scale)
}

function makeFlowLine(from: THREE.Vector3, to: THREE.Vector3, color: number, opacity = 0.28) {
  const geo = new THREE.BufferGeometry().setFromPoints([from.clone(), to.clone()])
  const line = new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  )
  return line
}

function makePedestal(x: number, color: string, width = 1.6) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.1, 0.55),
    metallicMaterial(color, 0.2),
  )
  mesh.position.set(x, -1.15, 0)
  return mesh
}

function fitCameraToScene(camera: THREE.PerspectiveCamera, aspect: number) {
  const spanX = 6.6
  const spanY = 4.6
  const vFov = (camera.fov * Math.PI) / 180
  const distY = spanY / (2 * Math.tan(vFov / 2))
  const distX = spanX / (2 * Math.tan(vFov / 2) * aspect)
  camera.position.z = Math.max(distX, distY) + 0.45
  camera.position.y = 0.1
}

type LiveQuestion = {
  mesh: THREE.Mesh
  animStart: number
  slot: number
  globalIndex: number
}

type ParticlePhase = 'idle' | 'toChat' | 'toFaq'

export function FaqMindMapCanvas({ active = true }: { active?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !active) return

    let frameId = 0
    let disposed = false
    let initialized = false
    let teardown: (() => void) | null = null
    let questionTimer: ReturnType<typeof setInterval> | null = null

    const boot = () => {
      if (disposed) return
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (width < 32 || height < 32) return
      if (initialized) return
      initialized = true

      let pickIndex = 0
      let totalAdded = 0
      const liveQuestions: LiveQuestion[] = []
      const billboard: THREE.Object3D[] = []

      let particlePhase: ParticlePhase = 'idle'
      let particleStart = 0
      let particleFrom = new THREE.Vector3()
      let particleTo = new THREE.Vector3()

      const scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x000000, 0.028)

      const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100)
      camera.lookAt(0, 0, 0)
      fitCameraToScene(camera, width / height)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      scene.add(new THREE.AmbientLight(0xffffff, 0.42))
      const key = new THREE.PointLight(0x00d4ff, 2.4, 50)
      key.position.set(0, 3, 10)
      scene.add(key)

      scene.add(makePedestal(ZONE.client.x, '#ffffff', 1.1))
      scene.add(makePedestal(ZONE.chatbot.x, '#00d4ff', 1.45))
      scene.add(makePedestal(ZONE.faq.x, '#1e5eff', 2.2))

      const lineClientChat = makeFlowLine(
        new THREE.Vector3(ZONE.client.x + 0.55, 0.08, 0.02),
        new THREE.Vector3(ZONE.chatbot.x - CHATBOT_RADIUS - 0.15, 0.15, 0.02),
        0xffffff,
        0.5,
      )
      const lineChatFaq = makeFlowLine(
        new THREE.Vector3(ZONE.chatbot.x + CHATBOT_RADIUS + 0.15, 0.15, 0.02),
        new THREE.Vector3(ZONE.faq.x - FAQ_BOARD_W * 0.5, 0.05, 0.02),
        0x1e5eff,
        0.5,
      )
      scene.add(lineClientChat, lineChatFaq)

      const faqGroup = new THREE.Group()
      faqGroup.position.copy(ZONE.faq)
      scene.add(faqGroup)

      const faqBoard = new THREE.Mesh(
        new THREE.BoxGeometry(FAQ_BOARD_W, FAQ_BOARD_H, 0.1),
        metallicMaterial('#1e5eff', 0.32),
      )
      faqBoard.position.set(0, -0.05, -0.06)
      faqGroup.add(faqBoard)

      const headerMesh = labelFromTexture(makeCounterHeaderTexture('0 / 20'), LABEL_SCALE.header * 0.55)
      headerMesh.position.set(0, FAQ_BOARD_H * 0.5 + 0.22, 0.12)
      faqGroup.add(headerMesh)
      billboard.push(headerMesh)

      const chatGroup = new THREE.Group()
      chatGroup.position.copy(ZONE.chatbot)
      scene.add(chatGroup)

      const chatbot = new THREE.Mesh(
        new THREE.IcosahedronGeometry(CHATBOT_RADIUS, 2),
        metallicMaterial('#00d4ff', 0.65),
      )
      chatbot.position.set(0, 0.25, 0)
      chatGroup.add(chatbot)

      const chatTag = makeLabel('Chatbot', '#00d4ff', LABEL_SCALE.chatTag, { w: 300 })
      chatTag.position.set(0, -CHATBOT_RADIUS - 0.48, 0.12)
      chatGroup.add(chatTag)
      billboard.push(chatTag)

      const phoneGroup = new THREE.Group()
      phoneGroup.position.copy(ZONE.client)
      scene.add(phoneGroup)

      const phoneBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 1.42, 0.1),
        metallicMaterial('#aaaaaa', 0.38),
      )
      phoneGroup.add(phoneBody)

      const phoneScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 1.2, 0.06),
        metallicMaterial('#0a1628', 0.58),
      )
      phoneScreen.position.z = 0.07
      phoneGroup.add(phoneScreen)

      const phoneLabel = makeLabel('Cliente móvil', '#ffffff', LABEL_SCALE.phoneTitle, { w: 340 })
      phoneLabel.position.set(0, -0.95, 0.12)
      phoneGroup.add(phoneLabel)
      billboard.push(phoneLabel)

      type NotifNode = { mesh: THREE.Mesh; offset: THREE.Vector3 }
      const notifications: NotifNode[] = FAQ_NOTIFICATIONS.map((n, i) => {
        const mesh = makeLabel(n.text, n.color, LABEL_SCALE.notif, { w: 400 })
        const offset = new THREE.Vector3(0.9, 0.58 - i * 0.4, 0.14)
        mesh.position.copy(offset)
        mesh.scale.set(0, 0, 0)
        mesh.visible = false
        phoneGroup.add(mesh)
        billboard.push(mesh)
        return { mesh, offset }
      })

      const rankGroup = new THREE.Group()
      rankGroup.position.set(0, -0.15, 0.08)
      rankGroup.visible = false
      phoneGroup.add(rankGroup)

      FAQ_RANKED_PRODUCTS.forEach((p, i) => {
        const mesh = makeLabel(p.name, p.color, LABEL_SCALE.rank, {
          w: 380,
          rank: p.rank,
          sub: `${p.count}`,
        })
        mesh.position.set(0, 0.42 - i * 0.34, 0.1)
        mesh.scale.set(0.95, 0.95, 0.95)
        rankGroup.add(mesh)
        billboard.push(mesh)
      })

      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
      )
      particle.visible = false
      scene.add(particle)

      function disposeLabel(mesh: THREE.Mesh) {
        faqGroup.remove(mesh)
        mesh.geometry.dispose()
        const m = mesh.material as THREE.MeshBasicMaterial
        if (m.map) m.map.dispose()
        m.dispose()
        const idx = billboard.indexOf(mesh)
        if (idx >= 0) billboard.splice(idx, 1)
      }

      function updateHeader() {
        const n =
          totalAdded % FAQ_STANDARD_QUESTIONS.length ||
          (totalAdded > 0 ? FAQ_STANDARD_QUESTIONS.length : 0)
        const display = totalAdded === 0 ? 0 : n
        const tex = makeCounterHeaderTexture(`${display} / ${FAQ_STANDARD_QUESTIONS.length}`)
        const mat = headerMesh.material as THREE.MeshBasicMaterial
        if (mat.map) mat.map.dispose()
        mat.map = tex
        mat.needsUpdate = true
      }

      function startParticleFlow(elapsed: number) {
        particle.visible = true
        particlePhase = 'toChat'
        particleStart = elapsed
        particleFrom.set(ZONE.client.x + 0.35, ZONE.client.y + 0.15, 0.05)
        particleTo.copy(ZONE.chatbot)
        particle.position.copy(particleFrom)
        particle.scale.setScalar(1)
      }

      function applyExtras(count: number) {
        ;(faqBoard.material as THREE.MeshStandardMaterial).emissiveIntensity =
          count > 0 ? 0.32 + Math.min(count, 10) * 0.02 : 0.22
        ;(chatbot.material as THREE.MeshStandardMaterial).emissiveIntensity =
          count >= 2 ? 0.65 : 0.4

        notifications.forEach((n, i) => {
          const visible =
            (count >= 6 && i === 0) ||
            (count >= 10 && i <= 1) ||
            (count >= 15 && i <= 2)
          n.mesh.visible = visible
          n.mesh.scale.setScalar(visible ? 1 : 0)
        })
        ;(phoneBody.material as THREE.MeshStandardMaterial).emissiveIntensity =
          count >= 6 ? 0.5 : 0.3

        rankGroup.visible = count >= 15
      }

      function addNextQuestion(elapsed: number) {
        const text = FAQ_STANDARD_QUESTIONS[pickIndex]
        pickIndex = (pickIndex + 1) % FAQ_STANDARD_QUESTIONS.length
        totalAdded += 1

        liveQuestions.forEach((q) => {
          q.slot += 1
        })

        const qIndex =
          totalAdded <= FAQ_STANDARD_QUESTIONS.length
            ? totalAdded
            : (totalAdded % FAQ_STANDARD_QUESTIONS.length) || FAQ_STANDARD_QUESTIONS.length

        const mesh = makeLabel(text, '#00d4ff', LABEL_SCALE.question, { w: 620, index: qIndex })
        mesh.position.set(-0.05, LIST_TOP_Y, 0.16)
        mesh.scale.set(0.001, 0.001, 0.001)
        faqGroup.add(mesh)
        billboard.push(mesh)

        liveQuestions.unshift({
          mesh,
          animStart: elapsed,
          slot: 0,
          globalIndex: totalAdded,
        })

        while (liveQuestions.length > MAX_VISIBLE_QUESTIONS) {
          const removed = liveQuestions.pop()!
          disposeLabel(removed.mesh)
        }

        startParticleFlow(elapsed)

        updateHeader()
        applyExtras(totalAdded)
      }

      const clock = new THREE.Clock()

      questionTimer = setInterval(() => {
        if (disposed) return
        addNextQuestion(clock.getElapsedTime())
      }, FAQ_QUESTION_INTERVAL_MS)

      addNextQuestion(0)

      function animate() {
        if (disposed) return
        frameId = requestAnimationFrame(animate)

        const t = clock.getElapsedTime()

        liveQuestions.forEach((q) => {
          const age = t - q.animStart
          const pop = easeOutBack(Math.min(age / POP_DURATION, 1))
          const slide = easeOutCubic(Math.min(age / 0.35, 1))

          const targetY = LIST_TOP_Y - q.slot * ROW_HEIGHT
          const targetX = 0
          q.mesh.position.x = THREE.MathUtils.lerp(-0.85, targetX, slide)
          q.mesh.position.y = THREE.MathUtils.lerp(LIST_TOP_Y + 0.2, targetY, Math.min(age / 0.45, 1))
          q.mesh.position.z = 0.14 + q.slot * 0.01

          const s = LABEL_SCALE.question * pop
          q.mesh.scale.set(s, s, s)

          if (q.slot === 0 && age < 1) {
            q.mesh.position.y += Math.sin(age * 12) * 0.018 * (1 - age)
          }
        })

        if (particle.visible && particlePhase !== 'idle') {
          const age = t - particleStart
          const phaseDur = 0.38

          if (particlePhase === 'toChat') {
            const p = Math.min(age / phaseDur, 1)
            particle.position.lerpVectors(particleFrom, particleTo, easeOutCubic(p))
            if (p >= 1) {
              particlePhase = 'toFaq'
              particleStart = t
              particleFrom.copy(ZONE.chatbot)
              particleTo.set(ZONE.faq.x - 0.35, ZONE.faq.y + 0.2, 0.08)
            }
          } else if (particlePhase === 'toFaq') {
            const p = Math.min(age / phaseDur, 1)
            particle.position.lerpVectors(particleFrom, particleTo, easeOutCubic(p))
            particle.scale.setScalar(1 - p * 0.35)
            if (p >= 1) {
              particlePhase = 'idle'
              particle.visible = false
            }
          }
        }

        const flowPulse = 0.3 + Math.sin(t * 2.5) * 0.12
        ;(lineClientChat.material as THREE.LineBasicMaterial).opacity = flowPulse
        ;(lineChatFaq.material as THREE.LineBasicMaterial).opacity = flowPulse

        chatbot.rotation.y = t * 0.5
        chatbot.rotation.x = Math.sin(t * 0.4) * 0.08
        phoneGroup.position.y = ZONE.client.y + Math.sin(t * 1.1) * 0.035

        if (totalAdded >= 6) {
          phoneGroup.rotation.z = Math.sin(t * 2.8) * 0.015
        }

        notifications.forEach((n, i) => {
          if (!n.mesh.visible) return
          n.mesh.position.x = n.offset.x + Math.sin(t * 2.5 + i) * 0.025
          n.mesh.position.y = n.offset.y + Math.abs(Math.sin(t * 3 + i)) * 0.035
        })

        billboard.forEach((lbl) => {
          lbl.quaternion.copy(camera.quaternion)
        })

        camera.position.x = Math.sin(t * 0.07) * 0.12
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      animate()

      const onResize = () => {
        const w = mount.clientWidth
        const h = mount.clientHeight
        if (w < 32 || h < 32) return
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        fitCameraToScene(camera, w / h)
        renderer.setSize(w, h)
      }

      const ro = new ResizeObserver(onResize)
      ro.observe(mount)
      onResize()

      teardown = () => {
        if (questionTimer) clearInterval(questionTimer)
        cancelAnimationFrame(frameId)
        ro.disconnect()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            obj.geometry.dispose()
            const m = obj.material
            if (Array.isArray(m)) m.forEach((x) => x.dispose())
            else {
              if (m instanceof THREE.MeshBasicMaterial && m.map) m.map.dispose()
              m.dispose()
            }
          }
        })
      }
    }

    boot()
    const ro = new ResizeObserver(boot)
    ro.observe(mount)

    return () => {
      disposed = true
      ro.disconnect()
      teardown?.()
    }
  }, [active])

  return (
    <div className="pitchPipeline pitchPipeline--faq pitchPipeline--faq-full">
      <div className="pitchPipeline__canvas" ref={mountRef} aria-hidden="true" />
    </div>
  )
}
