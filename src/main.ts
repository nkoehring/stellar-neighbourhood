import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector2,
  Raycaster,
  Intersection,
  Object3D,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { planeGeometry } from './plane'
import { renderStars, Star } from './stars'

function init() {
  const w = window.innerWidth
  const h = window.innerHeight
  const radius = 50
  const infoEl = document.getElementById('info')!

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)

  const scene = new Scene()
  const camera = new PerspectiveCamera(30, w / h, 0.01, 1001)
  camera.position.x = 0
  camera.position.y = radius
  camera.position.z = radius * 2

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true
  controls.enableRotate = true
  controls.enablePan = true
  controls.maxDistance = radius * 2.5
  controls.minDistance = 0.1
  controls.listenToKeyEvents(window)

  const plane = planeGeometry(radius)
  const stars = renderStars(radius)

  scene.add(stars)
  scene.add(plane)

  const pointer = new Vector2()
  const raycaster = new Raycaster()
  const intersections: Intersection<Object3D<Event>>[] = []

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  })
  document.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  })
  document.addEventListener('click', () => {
    infoEl.innerText = 'Click a star to get options.'
    for (let star of stars.children) {
      ;(star as Star).highlighted = false
    }

    let closest: Intersection<Object3D<Event>> | null = null

    for (let i of intersections) {
      if (i.distanceToRay === undefined) continue // ignore Lines
      if (closest === null || i.distanceToRay < (closest.distanceToRay ?? 0)) {
        closest = i
      }
    }

    if (closest === null) return

    const star = closest.object.parent as Star
    if (star.isStar) {
      star.highlighted = true
      infoEl.innerText = JSON.stringify(star.starData)
    }
  })

  for (let child of stars.children) {
    ;(child as Star).labelEl.addEventListener('click', (event) => {
      event.stopPropagation()

      for (let star of stars.children) {
        ;(star as Star).highlighted = false
      }

      const star = child as Star
      star.highlighted = true
      infoEl.innerText = JSON.stringify(star.starData)
    })
  }

  renderer.setAnimationLoop(() => {
    raycaster.setFromCamera(pointer, camera)

    intersections.length = 0
    raycaster.intersectObject(stars, true, intersections)

    renderer.render(scene, camera)

    // update label positions in HTML space
    // Attention: This has to happen after the render call, to avoid flickering
    for (let star of stars.children) {
      ;(star as Star).setLabelPos(camera, w, h)
      // set label z-index to distance to make them overlap intuitively
    }
  })

  document.body.prepend(renderer.domElement)
}

init()
