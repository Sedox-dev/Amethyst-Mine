type Fn = () => void

interface IGame {
  update(fn: Fn): void
  loop(): void
}

export class Game implements IGame {
  private callbacks: Fn[] = []

  update = (fn: Fn) => {
    this.callbacks.push(fn)
  }

  loop = () => {
    for (const fn of this.callbacks) {
      fn()
    }

    requestAnimationFrame(this.loop)
  }
}
