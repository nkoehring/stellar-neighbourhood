import {
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  Group,
  Line,
  LineBasicMaterial,
  Scene,
  Vector3,
  Spherical,
} from 'three'

import data from './testdata.json'

export interface StarData {
  name: string
  type: string
  spectral: string
  radius: number
  phi: number
  theta: number
}

class Star extends Group {
  private tangentialCoords = new Vector3()
  private cartesianCoords = new Vector3()
  private sphericalCoords = new Spherical()
  private isHighlighted = false

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: 1, vertexColors: true })

  private poleLine = new Line(new BufferGeometry(), this.lineMaterial)

  constructor(star: StarData) {
    super()

    const { radius, phi, theta } = star
    this.sphericalCoords.set(radius, phi, theta)
    this.cartesianCoords.setFromSpherical(this.sphericalCoords)

    const { x, z } = this.cartesianCoords
    this.tangentialCoords.set(x, 0, z)

    this.poleLine.geometry.setFromPoints([this.cartesianCoords, this.tangentialCoords])

    this.add(this.poleLine)

    const geometry = new BufferGeometry()
    const coords = [this.cartesianCoords.x, this.cartesianCoords.y, this.cartesianCoords.z]
    geometry.setAttribute('position', new Float32BufferAttribute(coords, 3))
    geometry.setAttribute('color', new Float32BufferAttribute([255, 255, 255], 3))
    geometry.computeBoundingSphere()

    const point = new Points(geometry, this.pointMaterial)
    this.add(point)
  }
}

export function renderStars(maxRadius: number) {
  const group = new Group()
  data.forEach((star) => {
    if (star.radius > maxRadius) return
    group.add(new Star(star))
  })

  return group
}
