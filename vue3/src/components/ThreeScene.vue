<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let roller: THREE.Group

function createRoller(): THREE.Group {
  const group = new THREE.Group()

  // 车身主体
  const bodyGeom = new THREE.BoxGeometry(4, 2, 2.5)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.3,
    roughness: 0.7,
  })
  const body = new THREE.Mesh(bodyGeom, bodyMat)
  body.position.set(0, 1.5, 0)
  body.castShadow = true
  group.add(body)

  // 驾驶室
  const cabinGeom = new THREE.BoxGeometry(2.2, 1.8, 2.2)
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.5,
    roughness: 0.4,
  })
  const cabin = new THREE.Mesh(cabinGeom, cabinMat)
  cabin.position.set(-0.5, 3.2, 0)
  cabin.castShadow = true
  group.add(cabin)

  // 前挡风玻璃
  const glassGeom = new THREE.BoxGeometry(0.05, 1.4, 2)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.5,
    metalness: 0.8,
    roughness: 0.1,
  })
  const windshield = new THREE.Mesh(glassGeom, glassMat)
  windshield.position.set(0.65, 3.2, 0)
  group.add(windshield)

  // 前碾压轮
  const drumGeom = new THREE.CylinderGeometry(0.8, 0.8, 3, 32)
  const drumMat = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    metalness: 0.8,
    roughness: 0.3,
  })
  const drum = new THREE.Mesh(drumGeom, drumMat)
  drum.rotation.x = Math.PI / 2
  drum.position.set(2.8, 0.8, 0)
  drum.castShadow = true
  group.add(drum)

  // 后碾压轮
  const rearDrum = new THREE.Mesh(drumGeom.clone(), drumMat.clone())
  rearDrum.rotation.x = Math.PI / 2
  rearDrum.position.set(-2.8, 0.8, 0)
  rearDrum.castShadow = true
  group.add(rearDrum)

  // 后轮（橡胶）
  const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24)
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    metalness: 0.1,
    roughness: 0.9,
  })
  const wheelPositions = [
    [-1.8, 0.5, 1.3],
    [-1.8, 0.5, -1.3],
    [0.2, 0.5, 1.3],
    [0.2, 0.5, -1.3],
  ]
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, y, z)
    wheel.castShadow = true
    group.add(wheel)
  })

  // 前车灯
  const lightGeom = new THREE.BoxGeometry(0.3, 0.3, 0.5)
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 0.8,
  })
  const leftLight = new THREE.Mesh(lightGeom, lightMat)
  leftLight.position.set(2.1, 1.5, 1.1)
  group.add(leftLight)
  const rightLight = new THREE.Mesh(lightGeom, lightMat)
  rightLight.position.set(2.1, 1.5, -1.1)
  group.add(rightLight)

  // 尾灯
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.6,
  })
  const leftTail = new THREE.Mesh(lightGeom, tailMat)
  leftTail.position.set(-2.1, 1.5, 1.1)
  group.add(leftTail)
  const rightTail = new THREE.Mesh(lightGeom, tailMat)
  rightTail.position.set(-2.1, 1.5, -1.1)
  group.add(rightTail)

  // 排气管
  const exhaustGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8)
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.9,
    roughness: 0.2,
  })
  const exhaust = new THREE.Mesh(exhaustGeom, exhaustMat)
  exhaust.position.set(-1.5, 2.8, 0.8)
  group.add(exhaust)

  // GPS天线
  const antennaGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8)
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const antenna = new THREE.Mesh(antennaGeom, antennaMat)
  antenna.position.set(-0.5, 4.3, 0)
  group.add(antenna)

  // GPS天线顶部
  const antennaTopGeom = new THREE.SphereGeometry(0.06, 8, 8)
  const antennaTopMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.5,
  })
  const antennaTop = new THREE.Mesh(antennaTopGeom, antennaTopMat)
  antennaTop.position.set(-0.5, 4.62, 0)
  group.add(antennaTop)

  return group
}

function createRoad(): THREE.Group {
  const group = new THREE.Group()

  // 主路面
  const roadGeom = new THREE.PlaneGeometry(80, 12)
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x4b5563,
    roughness: 0.9,
  })
  const road = new THREE.Mesh(roadGeom, roadMat)
  road.rotation.x = -Math.PI / 2
  road.receiveShadow = true
  group.add(road)

  // 中心线
  for (let i = -38; i < 40; i += 4) {
    const lineGeom = new THREE.PlaneGeometry(2, 0.15)
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.8,
    })
    const line = new THREE.Mesh(lineGeom, lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(i, 0.01, 0)
    group.add(line)
  }

  // 边线
  const edgeGeom = new THREE.PlaneGeometry(80, 0.2)
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const leftEdge = new THREE.Mesh(edgeGeom, edgeMat)
  leftEdge.rotation.x = -Math.PI / 2
  leftEdge.position.set(0, 0.01, -5.8)
  group.add(leftEdge)
  const rightEdge = new THREE.Mesh(edgeGeom, edgeMat)
  rightEdge.rotation.x = -Math.PI / 2
  rightEdge.position.set(0, 0.01, 5.8)
  group.add(rightEdge)

  // 已碾压区域（绿色）
  const completedGeom = new THREE.PlaneGeometry(30, 10)
  const completedMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    transparent: true,
    opacity: 0.3,
    roughness: 0.9,
  })
  const completed = new THREE.Mesh(completedGeom, completedMat)
  completed.rotation.x = -Math.PI / 2
  completed.position.set(-15, 0.02, 0)
  completed.receiveShadow = true
  group.add(completed)

  // 地面
  const groundGeom = new THREE.PlaneGeometry(200, 200)
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x365314,
    roughness: 1,
  })
  const ground = new THREE.Mesh(groundGeom, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  group.add(ground)

  return group
}

function createCones(): THREE.Group {
  const group = new THREE.Group()
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.6,
  })
  const conePositions = [
    [-12, 4.5],
    [-8, 4.5],
    [-4, 4.5],
    [0, 4.5],
    [4, 4.5],
    [8, 4.5],
    [12, 4.5],
    [-12, -4.5],
    [-8, -4.5],
    [-4, -4.5],
    [0, -4.5],
    [4, -4.5],
    [8, -4.5],
    [12, -4.5],
  ]

  conePositions.forEach(([x, z]) => {
    // Cone body
    const coneGeom = new THREE.ConeGeometry(0.15, 0.5, 8)
    const cone = new THREE.Mesh(coneGeom, coneMat)
    cone.position.set(x, 0.25, z)
    cone.castShadow = true
    group.add(cone)

    // Base
    const baseGeom = new THREE.BoxGeometry(0.3, 0.05, 0.3)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    const base = new THREE.Mesh(baseGeom, baseMat)
    base.position.set(x, 0.025, z)
    group.add(base)
  })

  return group
}

function createMeasurementTargets(): THREE.Group {
  const group = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.3,
  })

  const positions = [
    [-20, 2],
    [-15, -2],
    [-10, 2],
    [-5, -2],
    [0, 2],
    [5, -2],
    [10, 2],
    [15, -2],
    [20, 2],
  ]

  positions.forEach(([x, z]) => {
    const geom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8)
    const pole = new THREE.Mesh(geom, mat)
    pole.position.set(x, 0.6, z)
    group.add(pole)

    // Target ball on top
    const ballGeom = new THREE.SphereGeometry(0.12, 8, 8)
    const ball = new THREE.Mesh(ballGeom, mat)
    ball.position.set(x, 1.25, z)
    group.add(ball)
  })

  return group
}

function createTrees(): THREE.Group {
  const group = new THREE.Group()

  const treePositions = [
    [-30, -10], [-25, -8], [-20, -9], [-15, -10], [-10, -8],
    [10, -8], [15, -10], [20, -9], [25, -8], [30, -10],
    [-30, 10], [-25, 8], [-20, 9], [-15, 10], [-10, 8],
    [10, 8], [15, 10], [20, 9], [25, 8], [30, 10],
  ]

  treePositions.forEach(([x, z]) => {
    // Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f })
    const trunk = new THREE.Mesh(trunkGeom, trunkMat)
    trunk.position.set(x, 0.75, z)
    trunk.castShadow = true
    group.add(trunk)

    // Foliage
    const foliageGeom = new THREE.SphereGeometry(0.8, 8, 8)
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534 })
    const foliage = new THREE.Mesh(foliageGeom, foliageMat)
    foliage.position.set(x, 2.0, z)
    foliage.castShadow = true
    group.add(foliage)
  })

  return group
}

onMounted(() => {
  if (!containerRef.value) return

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 60, 120)

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    500
  )
  camera.position.set(12, 10, 12)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  containerRef.value.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2.1
  controls.minDistance = 5
  controls.maxDistance = 50

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(20, 30, 20)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 100
  directionalLight.shadow.camera.left = -30
  directionalLight.shadow.camera.right = 30
  directionalLight.shadow.camera.top = 30
  directionalLight.shadow.camera.bottom = -30
  scene.add(directionalLight)

  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x365314, 0.3)
  scene.add(hemisphereLight)

  // Road
  scene.add(createRoad())

  // Cones
  scene.add(createCones())

  // Measurement targets
  scene.add(createMeasurementTargets())

  // Trees
  scene.add(createTrees())

  // Roller
  roller = createRoller()
  roller.position.set(0, 0, 0)
  scene.add(roller)

  // Animation
  let time = 0
  function animate() {
    animationId = requestAnimationFrame(animate)
    time += 0.005

    // Slowly move roller forward and back
    roller.position.x = Math.sin(time) * 15
    roller.rotation.y = roller.position.x > 0 ? 0 : Math.PI

    controls.update()
    renderer.render(scene, camera)
  }

  animate()

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    if (!containerRef.value) return
    camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  })
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  controls?.dispose()
  renderer?.dispose()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
