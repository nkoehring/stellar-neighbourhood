import { BufferGeometry, Group, Line, LineBasicMaterial, Shape, Vector3 } from 'three'

export function planeGeometry(radius: number, n = 5) {
  const material = new LineBasicMaterial({
    color: 0xa0a0a0,
  })
  const plane = new Group()

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

  plane.add(new Line(xLine, material))
  plane.add(new Line(yLine, material))
  plane.add(new Line(zLine, material))

  const step = Math.round(radius / n)

  for (let r = step; r <= radius; r += step) {
    const shape = new Shape().moveTo(0, r).absarc(0, 0, r, 0, Math.PI * 2, false)
    shape.autoClose = true
    const geometry = new BufferGeometry().setFromPoints(shape.getPoints())
    const line = new Line(geometry, material)
    line.rotateX(Math.PI / 2)
    plane.add(line)
  }

  return plane
}
