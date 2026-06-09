import { Vector2 } from '../../engine/math/vector2.js'

interface INetwork {
  playerId: string | null
  players: Record<string, Player>
  mined: Set<string>
  status: boolean | null

  send(data: any): void
  registration(): void
}

type Player = {
  position: Vector2
  directions: {
    direction: Vector2
    last: Vector2
  }
  amethysts: number
  clip: string
}

export class Network implements INetwork {
  playerId: string | null
  players: Record<string, Player>
  mined: Set<string>
  status: boolean | null

  private ws: WebSocket
  private store: Record<string, any>

  constructor() {
    this.playerId = null
    this.players = {}
    this.store = {}
    this.mined = new Set<string>()

    this.ws = new WebSocket('http://localhost:8080')
    this.status = null

    this.ws.addEventListener('open', () => {
      this.status = true

      console.log('Socket is connected')
    })

    this.ws.addEventListener('message', ({ data }) => {
      if (!this.status) return

      const result = JSON.parse(data)

      if (result.login) {
        this.playerId = result.login.id
      }

      if (result.players && this.playerId) {
        delete result.players[this.playerId]
        this.players = result.players
      }

      if (result.mined) {
        this.mined = new Set(result.mined)
      }

      if (result.restored) {
        for (let i = 0; i < result.restored; i++) {
          this.mined.delete(result.restored[i])
        }
      }

      if (result.upgrade_sword_result) {
        this.store['upgrade_sword_result'] = result.upgrade_sword_result
      }

      if (result.upgrade_pickaxe_result) {
        this.store['upgrade_pickaxe_result'] = result.upgrade_pickaxe_result
      }
    })

    this.ws.addEventListener('close', () => {
      this.status = false

      throw new Error('Connection to the server was interrupted')
    })
  }

  send(data: any) {
    if (!this.status) return

    this.ws.send(JSON.stringify(data))
  }

  async listen(eventName: string) {
    let result = null

    while (!result) {
      await new Promise<void>((res) =>
        setTimeout(() => {
          if (this.store[eventName] !== undefined) {
            result = this.store[eventName]
            delete this.store[eventName]
          }

          res()
        }, 500),
      )
    }

    return result
  }

  async registration() {
    while (this.playerId === null && this.status) {
      await new Promise<void>((res) => setTimeout(res, 100))
    }
  }
}
