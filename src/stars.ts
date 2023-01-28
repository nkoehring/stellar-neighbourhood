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
  allTypes: string[]
  spectral: string
  radius: number
  phi: number
  theta: number
}

export class Star extends Group {
  public isStar = true
  public starData: StarData
  public labelEl = document.createElement('label')

  public coords = new Vector3()

  private isHighlighted = false
  private isDimmed = false
  private normalPointSize: number
  private highlightedPointSize: number

  private lineMaterial = new LineBasicMaterial({ color: 0xffffff })
  private pointMaterial = new PointsMaterial({ size: 1, vertexColors: true })
  private pointGeometry = new BufferGeometry()

  private whiteColor = new Float32BufferAttribute([255, 255, 255], 3)
  private grayColor = new Float32BufferAttribute([51, 51, 51], 3)
  private yellowColor = new Float32BufferAttribute([255, 255, 0], 3)

  private point: Points<BufferGeometry, PointsMaterial>
  private pole: Line<BufferGeometry, LineBasicMaterial>

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
    this.pole = new Line(new BufferGeometry(), this.lineMaterial)
    this.pole.geometry.setFromPoints([this.coords, tangentialCoords])
    this.add(this.pole)

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

  private setAttributes() {
    if (this.isDimmed && !this.isHighlighted) {
      this.pointMaterial.setValues({ size: this.normalPointSize })
      this.pointGeometry.setAttribute('color', this.grayColor)
      this.lineMaterial.setValues({ color: 0x333333 })
      this.labelEl.classList.remove('highlighted')
      this.labelEl.classList.add('dimmed')
      this.labelEl.style.zIndex = '0' // dimmed always in the back
    } else if (this.isHighlighted) {
      this.pointGeometry.setAttribute('color', this.yellowColor)
      this.pointMaterial.setValues({ size: this.highlightedPointSize })
      this.lineMaterial.setValues({ color: 0xffff00 })
      this.labelEl.classList.remove('dimmed')
      this.labelEl.classList.add('highlighted')
      this.labelEl.style.zIndex = '10000' // highlights always on top
    } else {
      this.pointGeometry.setAttribute('color', this.whiteColor)
      this.pointMaterial.setValues({ size: this.normalPointSize })
      this.lineMaterial.setValues({ color: 0xffffff })
      this.labelEl.classList.remove('highlighted')
      this.labelEl.classList.remove('dimmed')
    }
  }

  public get highlighted() {
    return this.isHighlighted
  }

  public set highlighted(isHighlighted) {
    this.isHighlighted = isHighlighted
    this.setAttributes()
  }

  public get dimmed() {
    return this.isDimmed
  }

  public set dimmed(isDimmed) {
    this.isDimmed = isDimmed
    this.setAttributes()
  }

  public setLabelPos(camera: Camera, width: number, height: number) {
    const dpr = window.devicePixelRatio
    const pos = this.coords.clone()
    pos.project(camera)

    pos.x = Math.round((0.5 + pos.x / 2) * (width / dpr))
    pos.y = Math.round((0.5 - pos.y / 2) * (height / dpr))

    this.labelEl.style.transform = `translate(${pos.x}px, ${pos.y}px)`

    if (!this.isDimmed && !this.isHighlighted) {
      const zIndex = `${10000000 - Math.round(pos.z * 10000000)}` // ridiculous
      this.labelEl.style.zIndex = zIndex
    }
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
      allTypes: ['White Dwarf', 'Star'],
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
