import { Animator } from '../../engine/core/animator.js'
import { Vector2 } from '../../engine/math/vector2.js'
import { scale, sprites } from '../config.js'
import { Entity } from './entity.js'

export class Rival extends Entity {
  key: string

  private animator: Animator

  constructor(ctx: CanvasRenderingContext2D, key: string) {
    super()

    this.key = key
    this.animator = new Animator(ctx, this.direction, sprites.player)
  }

  draw(lastDir: Vector2, clip: string) {
    this.animator.lastDir = lastDir.toDir()
    this.animator.play(clip, scale, this.position.local)
  }
}
