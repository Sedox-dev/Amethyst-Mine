interface IVector2 {
  x: number
  y: number

  sub(v: Vector2): Vector2
  isEqual(v: Vector2): boolean
  toDir(): string
  dirToVector2(direction: string): Vector2 | null
}

export class Vector2 implements IVector2 {
  public x: number
  public y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  isEqual(v: Vector2) {
    return this.x === v.x && this.y === v.y
  }

  toDir(): string {
    const directions: Record<string, string> = {
      '-1,0': 'LEFT',
      '1,0': 'RIGHT',
      '0,-1': 'UP',
      '0,1': 'DOWN',
    }

    const key = `${this.x},${this.y}`
    return directions[key]
  }

  dirToVector2(direction: string | null) {
    const directions: Record<string, string> = {
      LEFT: '-1,0',
      RIGHT: '1,0',
      UP: '0,-1',
      DOWN: '0,1',
    }

    if (!direction || !directions[direction]) {
      return null
    }

    const dir = directions[direction].split(',')
    return new Vector2(+dir[0], +dir[1])
  }
}
