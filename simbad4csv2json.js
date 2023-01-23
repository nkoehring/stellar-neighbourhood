import { parse } from 'csv-parse'
import { readFile, writeFile } from 'fs/promises'
;(async () => {
  const content = await readFile('input.csv')
  const records = []
  const columns = ['id', 'name', 'type', 'coords', 'spectral', 'distance']
  const parser = parse(content, {
    bom: true,
    delimiter: ';',
    trim: true,
    columns,
  })

  parser.on('readable', () => {
    let record
    while ((record = parser.read()) !== null) {
      // objects without spectral class are probably not stars
      if (record.spectral === '~') continue

      const [phi, theta] = record.coords.split(' ').map((n) => parseFloat(n))

      records.push({
        id: parseInt(record.id),
        name: record.name,
        type: record.type,
        spectral: record.spectral,
        radius: parseFloat(record.distance),
        phi,
        theta,
      })
    }
  })

  parser.on('end', async () => {
    await writeFile('output.json', JSON.stringify(records))
    console.log('wrote', records.length, 'records to output.json')
  })
})()
