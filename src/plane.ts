import {
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  Shape,
  ShapeGeometry,
  Mesh,
  Vector3,
  DoubleSide,
} from 'three'

export function planeGeometry(radius: number, n = 5) {
  const lineMaterial = new LineBasicMaterial({ color: 0x205020 })
  const shapeMaterial = new MeshBasicMaterial({
    color: 0x0,
    transparent: true,
    opacity: 0.8,
    side: DoubleSide,
  })
  const plane = new Group()

  const shape = new Shape()
  shape.moveTo(0, 0).absarc(0, 0, radius, 0, Math.PI * 2, false)
  const shapeGeometry = new ShapeGeometry(shape)
  shapeGeometry.rotateX(Math.PI / 2)
  plane.add(new Mesh(shapeGeometry, shapeMaterial))

  const xLine = new BufferGeometry().setFromPoints([
    new Vector3(-radius, 0, 0),
    new Vector3(radius, 0, 0),
  ])

  const yLine = new BufferGeometry().setFromPoints([
    new Vector3(0, -radius, 0),
    new Vector3(0, radius, 0),
  ])

  const zLine = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, -radius),
    new Vector3(0, 0, radius),
  ])

  plane.add(new Line(xLine, lineMaterial))
  plane.add(new Line(yLine, lineMaterial))
  plane.add(new Line(zLine, lineMaterial))

  const step = Math.round(radius / n)

  for (let r = step; r <= radius; r += step) {
    const shape = new Shape().moveTo(0, r).absarc(0, 0, r, 0, Math.PI * 2, false)
    shape.autoClose = true
    const geometry = new BufferGeometry().setFromPoints(shape.getPoints())
    const line = new Line(geometry, lineMaterial)
    line.rotateX(Math.PI / 2)
    plane.add(line)
  }

  return plane
}
