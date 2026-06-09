import { Vector2 } from '../../engine/math/vector2.js'
import { textures, tileSize } from '../config.js'
import { Network } from '../managers/network.js'

import Contract from '../managers/contract.js'

type Inventory = {
  get: () => Record<string, any>
  add: (item: any, amount?: number) => void
  decrement: (key: string, amount?: number) => void
  check: (args: string) => void
}

const Shop = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  address: string | null,
  ws: Network,
  inventory: () => Inventory,
) => {
  const coordinate = new Vector2(22, 12)
  const instruments = { sword: 0, pickaxe: 0 }

  let amethysts: number | null = null
  let isModalOpen: boolean = false
  let inputText: string = ''
  let errorMessage: string = ''
  let successfullyMessage: string = ''

  const { get } = Contract()

  const prices: Record<number, number> = {
    1: 10,
    2: 50,
    3: 100,
    4: 500,
    5: 0,
  }

  const image = new Image()
  image.src = textures.ui

  const modalWidth = 540
  const modalHeight = 380

  const getInventoryFromContract = () => {
    if (!address || address === 'guest') return

    get('get_player_tools', [address]).then((res) => {
      instruments.pickaxe = res[0]
      instruments.sword = res[1]
    })
  }

  const getLayout = () => {
    const modalX = (canvas.width - modalWidth) / 2
    const modalY = (canvas.height - modalHeight) / 2

    return {
      modal: { x: modalX, y: modalY, w: modalWidth, h: modalHeight },
      inputRect: { x: modalX + 40, y: modalY + 110, w: 220, h: 38 },
      sendBtn: { x: modalX + 280, y: modalY + 110, w: 100, h: 38 },
      pickaxeCard: { x: modalX + 40, y: modalY + 195, w: 220, h: 75 },
      pickaxeBtn: { x: modalX + 135, y: modalY + 230, w: 115, h: 32 },
      swordCard: { x: modalX + 280, y: modalY + 195, w: 220, h: 75 },
      swordBtn: { x: modalX + 375, y: modalY + 230, w: 115, h: 32 },
      closeBtn: { x: modalX + (modalWidth - 140) / 2, y: modalY + 315, w: 140, h: 40 },
    }
  }

  getInventoryFromContract()

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'у') {
      if (!isModalOpen) {
        if (errorMessage === 'Too far away') return
        isModalOpen = true
      } else {
        isModalOpen = false
      }
      inputText = ''
      errorMessage = ''
      return
    }

    if (!isModalOpen) return

    if (event.key >= '0' && event.key <= '9') {
      if (inputText.length < 5) {
        inputText += event.key
        errorMessage = ''
      }
    }
    if (event.key === 'Backspace') {
      inputText = inputText.slice(0, -1)
      errorMessage = ''
    }
    if (event.key === 'Enter') {
      executeWithdrawal()
    }
  })

  canvas.addEventListener('click', (event) => {
    if (!isModalOpen) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const layout = getLayout()

    if (
      mouseX >= layout.closeBtn.x &&
      mouseX <= layout.closeBtn.x + layout.closeBtn.w &&
      mouseY >= layout.closeBtn.y &&
      mouseY <= layout.closeBtn.y + layout.closeBtn.h
    ) {
      isModalOpen = false
      errorMessage = ''
    }

    if (
      mouseX >= layout.sendBtn.x &&
      mouseX <= layout.sendBtn.x + layout.sendBtn.w &&
      mouseY >= layout.sendBtn.y &&
      mouseY <= layout.sendBtn.y + layout.sendBtn.h
    ) {
      executeWithdrawal()
    }

    if (
      mouseX >= layout.pickaxeBtn.x &&
      mouseX <= layout.pickaxeBtn.x + layout.pickaxeBtn.w &&
      mouseY >= layout.pickaxeBtn.y &&
      mouseY <= layout.pickaxeBtn.y + layout.pickaxeBtn.h
    ) {
      buyUpgrade('pickaxe')
    }

    if (
      mouseX >= layout.swordBtn.x &&
      mouseX <= layout.swordBtn.x + layout.swordBtn.w &&
      mouseY >= layout.swordBtn.y &&
      mouseY <= layout.swordBtn.y + layout.swordBtn.h
    ) {
      buyUpgrade('sword')
    }
  })

  function executeWithdrawal() {
    if (errorMessage === 'Too far away') return

    const amountToSend = parseInt(inputText) || 0

    if (amountToSend <= 0) {
      errorMessage = 'Enter a valid amount'
      return
    }

    if (!address || address === 'guest') {
      errorMessage = 'Please connect your crypto wallet'
      return
    }

    if (amethysts !== null && amethysts >= amountToSend) {
      ws.send({
        cripto_exchange: {
          address: address,
          amount: amountToSend,
        },
      })

      inventory().decrement('amethysts', amountToSend)

      inputText = ''
      errorMessage = ''
    } else {
      errorMessage = 'Not enough amethysts'
    }
  }

  function buyUpgrade(itemType: 'pickaxe' | 'sword') {
    if (!prices[instruments[itemType]]) return
    if (errorMessage === 'Too far away') return

    const msgKey = itemType === 'sword' ? 'upgrade_sword' : 'upgrade_pickaxe'

    ws.send({
      [msgKey]: {
        address: address,
      },
    })

    ws.listen(`upgrade_${itemType}_result`).then((res: any) => {
      if (res.status && address && address !== 'guest') {
        inventory().check(address)
        getInventoryFromContract()

        successfullyMessage = 'Successfully'

        setTimeout(() => (successfullyMessage = ''), 5000)
      }

      if (!res.status) {
        errorMessage = res.message

        setTimeout(() => (errorMessage = ''), 5000)
      }
    })
  }

  return {
    updateAmethysts: () => {
      amethysts = inventory().get().amethysts?.count || 0
    },

    render: function (position: Vector2) {
      const playerTileX = Math.round(position.x / tileSize)
      const playerTileY = Math.round(position.y / tileSize)

      const diffX = Math.abs(coordinate.x - playerTileX)
      const diffY = Math.abs(coordinate.y - playerTileY)

      if (diffX > 2 || diffY > 2) {
        if (isModalOpen) {
          isModalOpen = false
          inputText = ''
        }
        errorMessage = 'Too far away'
        return
      } else if (errorMessage === 'Too far away') {
        errorMessage = ''
      }

      if (!isModalOpen) return

      const layout = getLayout()
      const centerX = layout.modal.x + modalWidth / 2

      ctx.fillStyle = 'rgba(10, 10, 15, 0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#0a0a0f'
      ctx.roundRect(layout.modal.x, layout.modal.y, layout.modal.w, layout.modal.h, 6)
      ctx.fill()

      if (!address || address === 'guest') {
        ctx.textAlign = 'center'
        ctx.fillStyle = 'White'
        ctx.font = 'bold 20px monospace'
        ctx.fillText(
          'Available with a connected crypto wallet',
          canvas.width / 2,
          canvas.height / 2,
        )

        return
      }

      ctx.textAlign = 'center'
      ctx.fillStyle = 'White'
      ctx.font = 'bold 20px monospace'
      ctx.fillText('CRYPTO & UPGRADE SHOP', centerX, layout.modal.y + 34)

      ctx.fillStyle = '#aaaaaa'
      ctx.font = '13px monospace'
      const shortAddress =
        address && address !== 'guest'
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : 'NOT CONNECTED'
      ctx.fillText(
        `Wallet: ${shortAddress}  |  Amethysts: ${amethysts !== null ? amethysts : '0'}`,
        centerX,
        layout.modal.y + 60,
      )

      ctx.strokeStyle = '#2a2a32'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(layout.modal.x + 20, layout.modal.y + 75)
      ctx.lineTo(layout.modal.x + modalWidth - 20, layout.modal.y + 75)
      ctx.stroke()

      ctx.textAlign = 'left'
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '12px monospace'
      ctx.fillText('Withdraw crypto:', layout.modal.x + 40, layout.modal.y + 98)

      ctx.fillStyle = '#0f0f12'
      ctx.strokeStyle = '#3a3a42'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(
        layout.inputRect.x,
        layout.inputRect.y,
        layout.inputRect.w,
        layout.inputRect.h,
        6,
      )
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#e040fb'
      ctx.font = 'bold 16px monospace'
      const displayTxt = inputText === '' ? '0' : inputText
      ctx.fillText(displayTxt, layout.inputRect.x + 15, layout.inputRect.y + 24)

      ctx.fillStyle = 'White'
      ctx.strokeStyle = 'White'
      ctx.beginPath()
      ctx.roundRect(layout.sendBtn.x, layout.sendBtn.y, layout.sendBtn.w, layout.sendBtn.h, 6)
      ctx.fill()
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.fillStyle = '#0a0a0f'
      ctx.font = 'bold 14px monospace'
      ctx.fillText('Send', layout.sendBtn.x + layout.sendBtn.w / 2, layout.sendBtn.y + 20)

      ctx.textAlign = 'left'
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '12px monospace'
      ctx.fillText('Available Upgrades:', layout.modal.x + 40, layout.modal.y + 180)

      ctx.fillStyle = '#14141a'
      ctx.beginPath()
      ctx.roundRect(
        layout.pickaxeCard.x,
        layout.pickaxeCard.y,
        layout.pickaxeCard.w,
        layout.pickaxeCard.h,
        6,
      )
      ctx.fill()

      ctx.fillStyle = '#252530'
      ctx.beginPath()
      ctx.roundRect(layout.pickaxeCard.x + 10, layout.pickaxeCard.y + 10, 56, 56, 4)
      ctx.fill()

      if (textures) {
        ctx.drawImage(
          image,
          48,
          16,
          16,
          16,
          layout.pickaxeCard.x + 10,
          layout.pickaxeCard.y + 10,
          56,
          56,
        )
      }

      ctx.fillStyle = 'White'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(
        `Pickaxe Lv${+instruments.pickaxe + 1}`,
        layout.pickaxeCard.x + 75,
        layout.pickaxeCard.y + 20,
      )

      ctx.fillStyle = 'White'
      ctx.beginPath()
      ctx.roundRect(
        layout.pickaxeBtn.x,
        layout.pickaxeBtn.y,
        layout.pickaxeBtn.w,
        layout.pickaxeBtn.h,
        4,
      )
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#0a0a0f'
      ctx.font = 'bold 12px monospace'
      ctx.fillText(
        !prices[instruments.pickaxe] ? 'Max' : `Buy [${prices[instruments.pickaxe]} AME]`,
        layout.pickaxeBtn.x + layout.pickaxeBtn.w / 2,
        layout.pickaxeBtn.y + 18,
      )

      ctx.textAlign = 'left'
      ctx.fillStyle = '#14141a'
      ctx.beginPath()
      ctx.roundRect(
        layout.swordCard.x,
        layout.swordCard.y,
        layout.swordCard.w,
        layout.swordCard.h,
        6,
      )
      ctx.fill()

      ctx.fillStyle = '#252530'
      ctx.beginPath()
      ctx.roundRect(layout.swordCard.x + 10, layout.swordCard.y + 10, 56, 56, 4)
      ctx.fill()

      if (textures) {
        ctx.drawImage(
          image,
          48,
          32,
          16,
          16,
          layout.swordCard.x + 10,
          layout.swordCard.y + 10,
          56,
          56,
        )
      }

      ctx.fillStyle = 'White'
      ctx.font = 'bold 13px monospace'
      ctx.fillText(
        `Sword Lv${+instruments.sword + 1}`,
        layout.swordCard.x + 75,
        layout.swordCard.y + 20,
      )

      ctx.fillStyle = 'White'
      ctx.beginPath()
      ctx.roundRect(layout.swordBtn.x, layout.swordBtn.y, layout.swordBtn.w, layout.swordBtn.h, 4)
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#0a0a0f'
      ctx.font = 'bold 12px monospace'
      ctx.fillText(
        !prices[instruments.sword] ? 'Max' : `Buy [${prices[instruments.sword]} AME]`,
        layout.swordBtn.x + layout.swordBtn.w / 2,
        layout.swordBtn.y + 18,
      )

      if (successfullyMessage) {
        ctx.fillStyle = '#33ffb8'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(successfullyMessage, centerX, layout.modal.y + 300)
      } else if (errorMessage) {
        ctx.fillStyle = '#ff3333'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(errorMessage, centerX, layout.modal.y + 300)
      }

      ctx.fillStyle = '#0a0a0f'
      ctx.strokeStyle = 'White'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(layout.closeBtn.x, layout.closeBtn.y, layout.closeBtn.w, layout.closeBtn.h, 8)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px monospace'
      ctx.fillText('Exit', layout.closeBtn.x + layout.closeBtn.w / 2, layout.closeBtn.y + 22)
    },
  }
}

export default Shop
