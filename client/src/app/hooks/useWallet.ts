export const useWallet = () => {
  let address: string | null = null
  let status: string = 'loading'

  const connect = async () => {
    const provider = window.nightly?.cedra

    if (provider) {
      const res = await provider.connect()

      address = res.address
      status = res.status.toLowerCase()
    }
  }

  const connectAsGuest = () => {
    address = 'guest'
    status = 'approved'
  }

  return {
    get address() {
      return address
    },
    get status() {
      return status
    },
    connect,
    connectAsGuest,
  }
}
