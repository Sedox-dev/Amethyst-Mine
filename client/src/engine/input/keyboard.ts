interface IKeyboard {
  isDown(key: string): boolean
}

export class Keyboard implements IKeyboard {
  private keys: Record<string, boolean> = {}

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })

    window.addEventListener('mousedown', (e) => {
      this.keys[e.button] = true
    })

    window.addEventListener('mouseup', (e) => {
      this.keys[e.button] = false
    })
  }

  isDown = (key: string): boolean => {
    return !!this.keys[key]
  }
}
