import dotenv from 'dotenv'
dotenv.config()

import { WebSocketServer, WebSocket } from 'ws'
import { randomUUID } from 'crypto'

import Web3 from './web3.js'

const PORT = process.env.PORT || 8080

const wss = new WebSocketServer({ port: +PORT })
const players: Record<string, any> = {}

let mined: string[] = []

const { exchange, upgradePickaxe, upgradeSword } = Web3()

wss.on('connection', (socket: WebSocket & { playerId: string }) => {
  const id = randomUUID()

  socket.playerId = id
  players[id] = {}

  socket.send(
    JSON.stringify({
      login: {
        id: id,
      },
    }),
  )

  console.log(`Client connected: ${id}`)

  socket.on('message', (data: string) => {
    const result = JSON.parse(data)

    if (result.player) {
      players[socket.playerId] = result.player
    }

    if (result.delete_cell) {
      const { x, y } = result.delete_cell.cell.coordinate
      const key: string = `${x},${y}`

      mined.push(key)
    }

    if (result.cripto_exchange) exchange(socket, result)
    if (result.upgrade_pickaxe) upgradePickaxe(socket, result)
    if (result.upgrade_sword) upgradeSword(socket, result)
  })

  socket.on('close', () => {
    const userId = socket.playerId
    delete players[userId]

    console.log(`Client disconnected: ${userId}`)
  })
})

setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ players: players }))
      client.send(JSON.stringify({ mined: mined }))
    }
  })
}, 1000 / 120)

setInterval(() => {
  const list = mined.splice(0, 3)

  if (list.length === 0) return

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ restored: list }))
    }
  })
}, 8000)
