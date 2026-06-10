import { Vector2 } from '../../engine/math/vector2.js'
import { Network } from '../managers/network.js'
import { Colliders } from '../../engine/core/colliders.js'
import { Draw } from './Draw.js'

import { textures, tileSize, env } from '../config.js'

type Grid = Cell[][]

enum CellType {
  NONE,
  CLIFF,
  CRISTAL,
  EMPTY,
}

interface ICave {
  build(offset: Vector2): void
  getCell(coordinate: Vector2): Cell | null
  deleteCell(coordinate: Vector2): void
  getEmptyCells(): Cell[]
  getColliders(): Cell[]
}

export class Cave implements ICave {
  private ctx: CanvasRenderingContext2D

  private grid: Grid
  private position: Vector2
  private colliders: Colliders
  private ws: Network

  private path: string = textures.tilemap.cave.path
  private draw: Draw

  private groundTileIndex: Set<number>
  private spawnArea: Set<string>

  constructor(
    ctx: CanvasRenderingContext2D,
    grid: number[][],
    position: Vector2,
    colliders: Colliders,
    ws: Network,
  ) {
    this.grid = []
    this.ctx = ctx
    this.position = position
    this.colliders = colliders
    this.ws = ws

    this.draw = new Draw(ctx)

    this.groundTileIndex = new Set([1, 2, 3, 4])
    this.spawnArea = new Set(['-81,28', '-80,28', '-79,28', '-78,28'])

    this.spawn(new Vector2(-85, -74), new Vector2(22, 27))

    for (let x = 0; x < grid.length; x++) {
      this.grid[x] = []

      for (let y = 0; y < grid[x].length; y++) {
        const coordinate = new Vector2(
          Math.round((y * tileSize + this.position.x) / tileSize),
          Math.round((x * tileSize + this.position.y) / tileSize),
        )

        const value = grid[x][y]
        const key = `${coordinate.x},${coordinate.y}`

        this.grid[x][y] = new Cell(
          value,
          this.groundTileIndex.has(value) ? CellType.CRISTAL : CellType.CLIFF,
          coordinate,
          !this.spawnArea.has(key),
        )
      }
    }

    colliders.add(this.getColliders())
  }

  build(offset: Vector2) {
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        const cell = this.grid[x][y]

        if (!this.groundTileIndex.has(cell.value)) continue
        if (this.ws.status && this.ws.mined.has(`${cell.coordinate.x},${cell.coordinate.y}`)) {
          cell.type = CellType.EMPTY
          cell.colider = false

          continue
        }

        if (this.ws.status && cell.type === CellType.EMPTY) {
          cell.type = CellType.CRISTAL
          cell.colider = true

          this.colliders.add([cell])
        }

        const pointX = Math.round((y * tileSize + this.position.x) / tileSize)
        const pointY = Math.round((x * tileSize + this.position.y) / tileSize)

        const key = `${pointX},${pointY}`

        if (this.grid[x][y].type === CellType.EMPTY) continue

        if (this.spawnArea.has(key)) {
          const cell = this.grid[x][y]

          if (cell.type !== CellType.NONE) {
            cell.value = 0
            cell.type = CellType.NONE
          }

          continue
        }

        const posX = Math.round(y * tileSize + this.position.x - offset.x)
        const posY = Math.round(x * tileSize + this.position.y - offset.y)

        this.draw.tile(this.path, posX, posY, 16, 16)

        const cellBelow = this.grid[x + 1][y]

        if (cellBelow.type === CellType.CRISTAL || cellBelow.type === CellType.CLIFF) continue

        this.draw.tile(this.path, posX, posY + tileSize, 16, 32)
      }
    }

    this.colliders.setByString(this.ws.mined)
  }

  getCell(coordinate: Vector2) {
    const pointX = Math.round(coordinate.y - env.cave.position.y / tileSize)
    const pointY = Math.round(coordinate.x - env.cave.position.x / tileSize)

    if (this.grid[pointX]) {
      if (this.grid[pointX][pointY]) {
        return this.grid[pointX][pointY]
      }
    }

    return null
  }

  deleteCell(coordinate: Vector2) {
    const pointX = Math.round(coordinate.y - env.cave.position.y / tileSize)
    const pointY = Math.round(coordinate.x - env.cave.position.x / tileSize)

    if (this.grid[pointX]) {
      if (this.grid[pointX][pointY]) {
        this.ws.send({ delete_cell: { cell: this.grid[pointX][pointY] } })
        this.grid[pointX][pointY].type = CellType.EMPTY
      }
    }
  }

  getEmptyCells() {
    return this.grid.flat().filter((cell) => cell.type === CellType.EMPTY)
  }

  getColliders() {
    return this.grid.flat().filter((cell: Cell) => cell.colider)
  }

  private spawn(pointX: Vector2, pointY: Vector2) {
    for (let x = pointX.x; x <= pointX.y; x++) {
      for (let y = pointY.x; y <= pointY.y; y++) {
        this.spawnArea.add(`${x},${y}`)
      }
    }
  }
}

interface ICell {
  value: number
  type: CellType
  coordinate: Vector2
  colider: boolean
}

class Cell implements ICell {
  value: number
  type: CellType
  coordinate: Vector2
  colider: boolean

  count: number

  constructor(value: number, type: CellType, coordinate: Vector2, colider: boolean = true) {
    this.value = value
    this.type = type
    this.coordinate = coordinate
    this.colider = colider

    this.count = 1
  }
}
