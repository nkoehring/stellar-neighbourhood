import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector2,
  Raycaster,
  Intersection,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { planeGeometry } from './plane'
import { renderStars, Star } from './stars'
import { InfoDisplay } from './info-display'

async function init() {
  const w = window.innerWidth
  const h = window.innerHeight
  const radius = 5
  const infoDisplay = new InfoDisplay()
  infoDisplay.hide()

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)

  const scene = new Scene()
  const camera = new PerspectiveCamera(30, w / h, 0.01, 1001)
  camera.position.x = 0
  camera.position.y = radius
  camera.position.z = radius * 5

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true
  controls.enableRotate = true
  controls.enablePan = true
  controls.maxDistance = radius * 5
  controls.minDistance = 0.1
  controls.listenToKeyEvents(window)

  const plane = planeGeometry(radius)
  const stars = await renderStars(radius)

  scene.add(stars)
  scene.add(plane)

  const pointer = new Vector2()
  const raycaster = new Raycaster()
  const intersections: Intersection[] = []

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
    for (let star of stars.children as Star[]) {
      star.highlighted = false
    }

    let closest: Intersection | null = null

    for (let i of intersections) {
      if (i.distanceToRay === undefined) continue // ignore Lines
      if (closest === null || i.distanceToRay < (closest.distanceToRay ?? 0)) {
        closest = i
      }
    }

    if (closest === null) {
      infoDisplay.hide()
      return
    }

    const star = closest.object.parent as Star
    if (star.isStar) {
      star.highlighted = true
      infoDisplay.render(star.starData)
      infoDisplay.show()
    }
  })

  for (let child of stars.children as Star[]) {
    child.labelEl.addEventListener('click', (event) => {
      event.stopPropagation()

      for (let star of stars.children as Star[]) {
        star.highlighted = false
      }

      const star = child as Star
      star.highlighted = true
      infoDisplay.render(star.starData)
      infoDisplay.show()
    })
  }

  renderer.setAnimationLoop(() => {
    raycaster.setFromCamera(pointer, camera)

    intersections.length = 0
    raycaster.intersectObject(stars, true, intersections)

    renderer.render(scene, camera)

    const distanceToPlane = camera.position.distanceTo(plane.children[0].position)

    // updating HTML space and the stars' color
    // Attention: This has to happen after the render call, to avoid flickering
    for (let star of stars.children as Star[]) {
      star.setLabelPos(camera, w, h)
      star.dimmed = camera.position.distanceTo(star.coords) > distanceToPlane
    }
  })

  document.body.prepend(renderer.domElement)
}

init()
