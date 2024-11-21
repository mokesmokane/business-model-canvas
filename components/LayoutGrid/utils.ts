import { GridItem } from './gridTypes'

export function cssToGridItems(areas: string[], cols: string, rows: string): GridItem[] {
  const colsArray = cols.split(' ').map(fr => parseInt(fr.replace('fr', '')))
  const rowsArray = rows.split(' ').map(size => size === 'auto' ? 1 : parseInt(size))
  
  return areas.map((area, index) => {
    const [rowStart, colStart, rowEnd, colEnd] = area.split(' / ').map(Number)
    return {
      i: index.toString(),
      x: colsArray.slice(0, colStart - 1).reduce((a, b) => a + b, 0),
      y: rowsArray.slice(0, rowStart - 1).reduce((a, b) => a + b, 0),
      w: colsArray.slice(colStart - 1, colEnd - 1).reduce((a, b) => a + b, 0),
      h: rowsArray.slice(rowStart - 1, rowEnd - 1).reduce((a, b) => a + b, 0),
    }
  })
}

export function gridItemsToCss(items: GridItem[]): { areas: string[], cols: string, rows: string } {
  if (items.length === 0) {
    return { areas: [], cols: '', rows: '' }
  }

  // Find the minimum x and y to normalize the grid
  const minX = Math.min(...items.map(item => item.x))
  const minY = Math.min(...items.map(item => item.y))

  // Normalize items
  const normalizedItems = items.map(item => ({
    ...item,
    x: item.x - minX,
    y: item.y - minY
  }))

  // Determine the number of columns and rows
  const maxX = Math.max(...normalizedItems.map(item => item.x + item.w))
  const maxY = Math.max(...normalizedItems.map(item => item.y + item.h))

  const areas = normalizedItems.map(item => 
    `${item.y + 1} / ${item.x + 1} / ${item.y + item.h + 1} / ${item.x + item.w + 1}`
  )

  const colSizes = Array(maxX).fill('1fr')
  const rowSizes = Array(maxY).fill('auto')

  return {
    areas,
    cols: colSizes.join(' '),
    rows: rowSizes.join(' ')
  }
}

