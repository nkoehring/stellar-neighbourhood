import {
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  Group,
  Line,
  LineBasicMaterial,
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

export class Star extends Group {
  public isStar = true
  public starData: StarData

  private tangentialCoords = new Vector3()
  private cartesianCoords = new Vector3()
  private sphericalCoords = new Spherical()

  private isHighlighted = false
  private normalPointSize = 2
  private highlightedPointSize = 3

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: this.normalPointSize, vertexColors: true })
  private pointGeometry = new BufferGeometry()

  private whiteColor = new Float32BufferAttribute([255, 255, 255], 3)
  private yellowColor = new Float32BufferAttribute([255, 255, 0], 3)

  private poleLine = new Line(new BufferGeometry(), this.lineMaterial)

  constructor(starData: StarData) {
    super()

    const { radius, phi, theta } = starData
    this.starData = starData
    this.sphericalCoords.set(radius, phi, theta)
    this.cartesianCoords.setFromSpherical(this.sphericalCoords)

    const { x, z } = this.cartesianCoords
    this.tangentialCoords.set(x, 0, z)

    this.poleLine.geometry.setFromPoints([this.cartesianCoords, this.tangentialCoords])

    this.add(this.poleLine)

    const coords = [this.cartesianCoords.x, this.cartesianCoords.y, this.cartesianCoords.z]
    this.pointGeometry.setAttribute('position', new Float32BufferAttribute(coords, 3))
    this.pointGeometry.setAttribute('color', this.whiteColor)
    this.pointGeometry.computeBoundingSphere()

    const point = new Points(this.pointGeometry, this.pointMaterial)
    this.add(point)
  }

  private setHighlight(isHighlight = true) {
    const color = isHighlight ? this.yellowColor : this.whiteColor
    this.pointGeometry.setAttribute('color', color)
    this.pointMaterial.setValues({
      size: isHighlight ? this.highlightedPointSize : this.normalPointSize,
    })
  }

  public get highlighted() {
    return this.isHighlighted
  }

  public set highlighted(isHighlighted) {
    this.isHighlighted = isHighlighted
    this.setHighlight(isHighlighted)
  }

  public toggleHighlight() {
    this.isHighlighted = !this.isHighlighted
    this.setHighlight(this.isHighlighted)
  }
}

export function renderStars(maxRadius: number) {
  const group = new Group()

  data.forEach((starData) => {
    if (starData.radius > maxRadius) return
    const star = new Star(starData)
    group.add(star)
  })

  return group
}
