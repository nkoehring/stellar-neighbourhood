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

class Star extends Group {
  private tangentialCoords = new Vector3()
  private cartesianCoords = new Vector3()
  private sphericalCoords = new Spherical()

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: 1, vertexColors: true })
  private pointGeometry = new BufferGeometry()

  private whiteColor = new Float32BufferAttribute([255, 255, 255], 3)
  private yellowColor = new Float32BufferAttribute([255, 255, 0], 3)

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

    const coords = [this.cartesianCoords.x, this.cartesianCoords.y, this.cartesianCoords.z]
    this.pointGeometry.setAttribute('position', new Float32BufferAttribute(coords, 3))
    this.pointGeometry.setAttribute('color', this.whiteColor)
    this.pointGeometry.computeBoundingSphere()

    const point = new Points(this.pointGeometry, this.pointMaterial)
    this.add(point)
  }

  setHighlight(isHighlight = true) {
    this.pointGeometry.setAttribute('color', isHighlight ? this.yellowColor : this.whiteColor)
  }
}

export function renderStars(maxRadius: number) {
  const group = new Group()
  const infoEl = document.getElementById('info')!

  data.forEach((starData) => {
    if (starData.radius > maxRadius) return
    const star = new Star(starData)
    group.add(star)

    let highlighted = false

    const btnEl = document.createElement('button')
    btnEl.addEventListener('click', () => {
      highlighted = !highlighted
      star.setHighlight(highlighted)
      btnEl.classList.toggle('highlighted', highlighted)
    })
    btnEl.innerText = starData.name
    infoEl.appendChild(btnEl)
  })

  return group
}
