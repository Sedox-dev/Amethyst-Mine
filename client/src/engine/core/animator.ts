import { Vector2 } from '../math/vector2.js'

interface IAnimator {
  unstoppable: boolean
  lastDir: string | null

  init(): Promise<void>
  play(clip: string, scale: number, position: Vector2, event?: Event, frameSize?: number): void
}

type Event = {
  index: number
  callback: () => void
}

type Sprites = Record<string, Record<string, string>>

export class Animator implements IAnimator {
  unstoppable: boolean = false
  lastDir: string | null

  private ctx: CanvasRenderingContext2D
  private direction: Vector2
  private sprites: Sprites

  private index: number
  private time: number
  private cooldown: number
  private currentClip: string | null
  private currentEvent: Event | null

  private cache: Record<string, HTMLImageElement> = {}

  constructor(ctx: CanvasRenderingContext2D, direction: Vector2, sprites: Sprites) {
    this.ctx = ctx
    this.direction = direction
    this.sprites = sprites

    this.index = 0
    this.time = 0
    this.cooldown = 100
    this.lastDir = null
    this.currentClip = null
    this.currentEvent = null
  }

  async init(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const dir in this.sprites) {
      for (const clip in this.sprites[dir]) {
        const path = this.sprites[dir][clip]

        if (!this.cache[path]) {
          const promise = new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.src = path

            img.onload = () => {
              this.cache[path] = img
              resolve()
            }
            img.onerror = () => reject()
          })

          promises.push(promise)
        }
      }
    }

    await Promise.all(promises)
  }

  play(clip: string, scale: number, position: Vector2, event?: Event, frameSize: number = 48) {
    let dir: string = this.direction.toDir()

    if (!dir) {
      dir = this.lastDir ? this.lastDir : 'DOWN'
    }

    this.lastDir = dir

    const path: string = this.sprites[dir][this.currentClip || clip]
    const image = this.cache[path] ? this.cache[path] : new Image()

    if (event != null) {
      this.unstoppable = true
      this.currentClip = clip
      this.currentEvent = event

      this.index = 0
    }

    if (!this.cache[path]) {
      image.src = path
      this.cache[path] = image
    }

    const frames = image.width / frameSize
    const frame = this.index % frames

    this.ctx.drawImage(
      image,
      frameSize * frame,
      0,
      frameSize,
      frameSize,
      position.x - (frameSize * scale) / 2,
      position.y - (frameSize * scale) / 2,
      frameSize * scale,
      frameSize * scale,
    )

    if (Date.now() >= this.time) {
      this.time = Date.now() + this.cooldown
      this.index++

      if (this.currentEvent?.index === frame && !!this.unstoppable) {
        this.currentEvent.callback()
      }

      if (frame === frames - 1) {
        this.unstoppable = false
        this.currentClip = null

        this.index = 0
      }
    }
  }
}
