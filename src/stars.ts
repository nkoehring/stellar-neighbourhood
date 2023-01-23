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

export interface StarData {
  id: number
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
  public labelEl = document.createElement('label')

  private labelDimmed = false

  public coords = new Vector3()

  private isHighlighted = false
  private normalPointSize: number
  private highlightedPointSize: number

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: 1, vertexColors: true })
  private pointGeometry = new BufferGeometry()

  private whiteColor = new Float32BufferAttribute([255, 255, 255], 3)
  private yellowColor = new Float32BufferAttribute([255, 255, 0], 3)

  private point: Points<BufferGeometry, PointsMaterial>

  constructor(starData: StarData, maxRadius: number) {
    super()

    this.starData = starData
    this.normalPointSize = maxRadius / 25
    this.highlightedPointSize = this.normalPointSize * 1.5
    this.pointMaterial.setValues({ size: this.normalPointSize })

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
    // stars with a proper name start with NAME, so lets strip that away
    this.labelEl.innerText = starData.name.replace(/^NAME /, '')
    container.appendChild(this.labelEl)
  }

  private setHighlight(isHighlight = true) {
    const color = isHighlight ? this.yellowColor : this.whiteColor
    this.pointGeometry.setAttribute('color', color)
    this.pointMaterial.setValues({
      size: isHighlight ? this.highlightedPointSize : this.normalPointSize,
    })
    this.labelEl.classList.toggle('highlighted', isHighlight)
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

    if (this.labelDimmed) {
      this.labelEl.style.zIndex = '0'
    } else {
      const zIndex = `${10000000 - Math.round(pos.z * 10000000)}` // ridiculous
      this.labelEl.style.zIndex = zIndex
    }
  }

  public dimLabel() {
    this.labelDimmed = true
    this.labelEl.style.opacity = '0.3'
    this.labelEl.style.zIndex = '0'
  }

  public undimLabel() {
    this.labelEl.style.opacity = '1'
    this.labelDimmed = false
  }
}

export async function renderStars(maxRadius: number) {
  const group = new Group()
  const data: StarData[] = (await import('./stars.json')).default

  const sol = new Star(
    {
      id: 0,
      name: 'Sol',
      type: 'White Dwarf',
      spectral: 'G2V',
      radius: 0.0,
      phi: 0.0,
      theta: 0.0,
    },
    maxRadius
  )

  group.add(sol) // lets not forget our beloved sun

  data.forEach((starData) => {
    if (starData.radius > maxRadius) return
    const star = new Star(starData, maxRadius)
    group.add(star)
  })

  return group
}
