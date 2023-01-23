import type { StarData } from './stars'

export class InfoDisplay {
  private container = document.getElementById('info')!
  private template = this.container.innerHTML

  constructor() {}

  render(data: StarData) {
    const name = data.name.replace(/^NAME /, '')
    const ly = Math.round(data.radius * 3.2615637 * 100) / 100
    const distance = `${data.radius} pc / ${ly} ly`

    const html = this.template
      .replace('{{ name }}', name)
      .replace('{{ type }}', data.type)
      .replace('{{ spectral }}', data.spectral)
      .replace('{{ distance }}', distance)

    this.container.innerHTML = html
  }

  show() {
    this.container.classList.remove('hidden')
  }

  hide() {
    this.container.classList.add('hidden')
  }
}
