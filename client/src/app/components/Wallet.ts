import { useWallet } from '../hooks/useWallet.js'

const Wallet = async () => {
  const ui = document.getElementById('ui') as HTMLDivElement
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const walletBtn = document.getElementById('connect-wallet') as HTMLButtonElement
  const guestBtn = document.getElementById('as-guest') as HTMLButtonElement

  const wallet = useWallet()

  const connect = async () => {
    while (wallet.status !== 'approved') {
      await new Promise((res) => setTimeout(res, 100))
    }

    ui.remove()
    canvas.style = 'display: block'
  }

  walletBtn.addEventListener('click', wallet.connect)
  guestBtn.addEventListener('click', wallet.connectAsGuest)

  await connect()
  return wallet
}

export default Wallet
