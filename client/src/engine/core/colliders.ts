import { Vector2 } from '../math/vector2.js'

interface IColliders {
  add(list: any[]): void
  get(position: Vector2): Collider
  set(coordinate: Vector2): void
  setByString(list: Set<string>): void
  next(position: Vector2, direction: Vector2): Collider & { direction: Vector2 }
  nextByDot(position: Vector2, direction: Vector2, pivot?: number): Collider
}

type Collider = {
  coordinate: Vector2
  isCollider: boolean
}

export class Colliders implements IColliders {
  private colliders: Record<string, number>
  private tileSize: number
  private lastDir: Vector2

  constructor(list: number[][], tileSize: number) {
    this.tileSize = tileSize
    this.colliders = {}
    this.lastDir = new Vector2()

    for (let x = 0; x < list.length; x++) {
      for (let y = 0; y < list[x].length; y++) {
        if (list[x][y] <= 0) continue

        const key = `${y},${x}`
        this.colliders[key] = 1
      }
    }
  }

  add(list: any[]) {
    for (let i = 0; i < list.length; i++) {
      const cell = list[i]
      const key = `${cell.coordinate.x},${cell.coordinate.y}`

      this.colliders[key] = 1
    }
  }

  get(position: Vector2) {
    const cell = new Vector2(
      Math.floor(position.x / this.tileSize),
      Math.floor(position.y / this.tileSize),
    )

    const key = `${cell.x},${cell.y}`

    return {
      coordinate: cell,
      isCollider: !!this.colliders[key],
    }
  }

  set(coordinate: Vector2) {
    const key = `${coordinate.x},${coordinate.y}`

    if (this.colliders[key]) {
      this.colliders[key] = 0
    }
  }

  setByString(list: Set<string>) {
    for (const item of list) {
      this.colliders[item] = 0
    }
  }

  next(position: Vector2, direction: Vector2) {
    const cell = new Vector2(
      Math.round(position.x / this.tileSize),
      Math.round(position.y / this.tileSize),
    )

    let key = `${cell.x + (this.lastDir.x === 0 ? direction.x : this.lastDir.x)},${
      cell.y + (this.lastDir.y === 0 ? direction.y : this.lastDir.y)
    }`

    if (direction.x !== 0 || direction.y !== 0) {
      this.lastDir.x = direction.x
      this.lastDir.y = direction.y

      if (Math.hypot(direction.x, direction.y) > 1) {
        this.lastDir.x = 0
      }

      key = `${cell.x + this.lastDir.x},${cell.y + this.lastDir.y}`
    }

    const target = new Vector2(cell.x + this.lastDir.x, cell.y + this.lastDir.y)

    return {
      coordinate: target,
      isCollider: !!this.colliders[key],
      direction: this.lastDir,
    }
  }

  nextByDot(position: Vector2, direction: Vector2, pivot: number = 0) {
    const cell = new Vector2(
      +((position.x + direction.x * (pivot * 5)) / this.tileSize).toFixed(1),
      +((position.y + 10 + direction.y * pivot) / this.tileSize).toFixed(1),
    )

    const next = new Vector2(
      Math.floor(cell.x + direction.x * 0.1),
      Math.floor(cell.y + direction.y * 0.1),
    )

    const key = `${next.x},${next.y}`

    return {
      coordinate: next,
      isCollider: !!this.colliders[key],
    }
  }
}
