import { Vector2 } from '../../engine/math/vector2.js'

interface IEntity {
  direction: Vector2
  position: {
    local: Vector2
    global: Vector2
  }

  go(x: number, y: number): void
}

export class Entity implements IEntity {
  direction: Vector2

  position = {
    local: new Vector2(),
    global: new Vector2(),
  }

  constructor() {
    this.direction = new Vector2()
  }

  go(x: number, y: number) {
    this.position.local = new Vector2(x, y)
  }
}
