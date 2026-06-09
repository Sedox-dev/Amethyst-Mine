import { Vector2 } from '../../engine/math/vector2.js'
import { grid, textures, tileSize } from '../config.js'

import Contract from '../managers/contract.js'

type ItemBar = {
  busy: boolean
  coordinate: Vector2
}

type Inventory = Record<
  string,
  {
    name: string
    type: string
    count: number
    level?: number
  }
>

const UI = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  const path = textures.ui
  let items: ItemBar[] = []

  const cache: Record<string, HTMLImageElement> = {}
  const tiles: Record<number | string, Vector2> = {
    1: new Vector2(16, 16),
    2: new Vector2(0, 16),
    3: new Vector2(16, 0),
    4: new Vector2(16, 32),

    amethysts: new Vector2(48, 0),
    pickaxe: new Vector2(48, 16),
    sword: new Vector2(48, 32),
  }

  const contract = {
    emeralds: null,
  }

  const { get } = Contract()

  const drawTile = (position: Vector2, offset: Vector2) => {
    const image = cache[path] || new Image()

    if (!image.src) {
      image.src = path

      cache[path] = image
    }

    ctx.drawImage(image, offset.x, offset.y, 16, 16, position.x, position.y, tileSize, tileSize)
  }

  const initialize = () => {
    get('get_remaining_amethysts').then((res) => (contract.emeralds = res[0]))
  }

  const background = (color: string) => {
    canvas.style.background = color
  }

  const counter = () => {
    const text = `Amethysts left: ${contract.emeralds || 'Loading...'}`
    const metrics = ctx.measureText(text)

    ctx.font = '18px Arial'
    ctx.fillStyle = 'White'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText(
      text,
      canvas.width - tileSize - metrics.width / 2,
      tileSize - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2,
    )
  }

  const itemsBar = (inventory: Inventory) => {
    const speed = 0.003
    const amplitude = 8
    const waveStep = 0.5

    items.length = 0

    for (let x = 0; x < grid.ui.inventory.length; x++) {
      for (let y = 0; y < grid.ui.inventory[x].length; y++) {
        const cell = grid.ui.inventory[x][y]

        if (!cell) continue

        drawTile(
          new Vector2(
            canvas.width / 2 - grid.ui.inventory.length * tileSize + tileSize * y,
            canvas.height - (grid.ui.inventory[x].length / 2) * tileSize + tileSize * x,
          ),
          new Vector2(tiles[cell].x, tiles[cell].y),
        )

        if (cell === 1 && Object.values(inventory).length) {
          items.push({ busy: false, coordinate: new Vector2(x, y) })
        }
      }
    }

    if (Object.values(inventory).length && items.length) {
      const inventoryToArray = Object.values(inventory)

      for (let i = 0; i < inventoryToArray.length; i++) {
        const cell = items[i]

        const bounce = Math.sin(Date.now() * speed + i * waveStep) * amplitude
        const coordinate = new Vector2(
          canvas.width / 2 - grid.ui.inventory.length * tileSize + tileSize * cell.coordinate.y,
          canvas.height -
            24 -
            (grid.ui.inventory[cell.coordinate.x].length / 2) * tileSize +
            tileSize * cell.coordinate.x,
        )

        drawTile(new Vector2(coordinate.x, coordinate.y + bounce), tiles[inventoryToArray[i].name])

        if (!cell.busy) cell.busy = true

        if (inventoryToArray[i].type === 'amethysts' || inventoryToArray[i].level) {
          ctx.font = '18px Arial'
          ctx.fillStyle = 'White'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          ctx.fillText(
            inventoryToArray[i].level
              ? `${inventoryToArray[i].level} Lv`
              : inventoryToArray[i].count.toString(),
            coordinate.x + tileSize / 2,
            coordinate.y + tileSize * 2,
          )
        }
      }
    }
  }

  initialize()

  return { itemsBar, counter, background }
}

export default UI
