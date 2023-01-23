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
  Camera,
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

  private coords = new Vector3()

  private isHighlighted = false
  private normalPointSize = 2
  private highlightedPointSize = 3

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: this.normalPointSize, vertexColors: true })
  private pointGeometry = new BufferGeometry()

  private whiteColor = new Float32BufferAttribute([255, 255, 255], 3)
  private yellowColor = new Float32BufferAttribute([255, 255, 0], 3)

  private labelEl = document.createElement('label')

  private point: Points<BufferGeometry, PointsMaterial>

  constructor(starData: StarData) {
    super()

    this.starData = starData

    const { radius, phi, theta } = starData
    const sphericalCoords = new Spherical(radius, phi, theta)
    this.coords.setFromSpherical(sphericalCoords)

    const { x, z } = this.coords
    const tangentialCoords = new Vector3(x, 0, z)

    // distance indicator / pole
    const poleLine = new Line(new BufferGeometry(), this.lineMaterial)
    poleLine.geometry.setFromPoints([this.coords, tangentialCoords])
    this.add(poleLine)

    // the actual "star"
    const coords = [this.coords.x, this.coords.y, this.coords.z]
    this.pointGeometry.setAttribute('position', new Float32BufferAttribute(coords, 3))
    this.pointGeometry.setAttribute('color', this.whiteColor)
    this.pointGeometry.computeBoundingSphere()

    this.point = new Points(this.pointGeometry, this.pointMaterial)
    this.add(this.point)

    // label
    const container = document.getElementById('labels')!
    this.labelEl.innerText = starData.name
    container.appendChild(this.labelEl)
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

  public setLabelPos(camera: Camera, width: number, height: number) {
    const dpr = window.devicePixelRatio
    const pos = this.coords.clone()
    pos.project(camera)

    pos.x = Math.round((0.5 + pos.x / 2) * (width / dpr))
    pos.y = Math.round((0.5 - pos.y / 2) * (height / dpr))

    this.labelEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    const zIndex = `${10000000 - Math.round(pos.z * 10000000)}`
    this.labelEl.style.zIndex = zIndex
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
