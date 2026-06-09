import {
  Account,
  Cedra,
  CedraConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from '@cedra-labs/ts-sdk'

const Web3 = () => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as string
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
  const MODULE = process.env.MODULE_NAME

  const config = new CedraConfig({ network: Network.TESTNET })
  const client = new Cedra(config)

  const keyVariant = 'ed25519' as PrivateKeyVariants
  const formattedKey = PrivateKey.formatPrivateKey(PRIVATE_KEY, keyVariant)
  const privateKey = new Ed25519PrivateKey(formattedKey)
  const admin = Account.fromPrivateKey({ privateKey })
  const adminAddrStr = admin.accountAddress.toString()

  const sendAdminTx = async (functionName: string, args: any[]) => {
    const tx = await client.transaction.build.simple({
      sender: admin.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::${MODULE}::${functionName}`,
        functionArguments: args,
      },
    })

    const auth = await client.transaction.sign({ signer: admin, transaction: tx })
    const pendingTx = await client.transaction.submit.simple({
      transaction: tx,
      senderAuthenticator: auth,
    })

    await client.waitForTransaction({ transactionHash: pendingTx.hash })

    return pendingTx.hash
  }

  async function fetchPlayerTools(playerAddr: string): Promise<[string, string]> {
    const [pickaxe, sword] = await client.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::${MODULE}::get_player_tools`,
        functionArguments: [adminAddrStr, playerAddr],
      },
    })

    return [String(pickaxe), String(sword)]
  }

  const exchange = async (socket: any, result: any) => {
    const amount = result.cripto_exchange.amount || 0
    const playerAddressStr = result.cripto_exchange.address

    if (!amount || !playerAddressStr) return

    try {
      await sendAdminTx('register_player', [playerAddressStr])
    } catch (error: any) {
      console.error('Failed to register user')
    }

    try {
      await sendAdminTx('exchange_directly_to_AME', [playerAddressStr, amount.toString()])

      console.log('AME coin exchange successfully.')

      socket.send(
        JSON.stringify({
          cripto_exchange_result: { message: 'AME coin exchange successfully', status: true },
        }),
      )
    } catch (error: any) {
      socket.send(
        JSON.stringify({
          cripto_exchange_result: { message: 'Coin exchange error', status: false },
        }),
      )
    }
  }

  const upgradePickaxe = async (socket: any, result: any) => {
    const playerAddressStr = result.upgrade_pickaxe.address

    if (!playerAddressStr) return

    try {
      await sendAdminTx('upgrade_pickaxe', [playerAddressStr])
      console.log('Pickaxe updated')

      const [pickaxeLevel, swordLevel] = await fetchPlayerTools(playerAddressStr)

      socket.send(
        JSON.stringify({
          upgrade_pickaxe_result: {
            pickaxe_level: parseInt(pickaxeLevel),
            sword_level: parseInt(swordLevel),
            status: true,
          },
        }),
      )
    } catch (error: any) {
      console.error('Pickaxe upgrade error')
      socket.send(
        JSON.stringify({
          upgrade_pickaxe_result: {
            message: 'Not enough AME in your wallet or max level reached.',
            status: false,
          },
        }),
      )
    }
  }

  const upgradeSword = async (socket: any, result: any) => {
    const playerAddressStr = result.upgrade_sword.address

    if (!playerAddressStr) return

    try {
      await sendAdminTx('upgrade_sword', [playerAddressStr])
      console.log('Sword updated')

      const [pickaxeLevel, swordLevel] = await fetchPlayerTools(playerAddressStr)

      socket.send(
        JSON.stringify({
          upgrade_sword_result: {
            pickaxe_level: parseInt(pickaxeLevel),
            sword_level: parseInt(swordLevel),
            status: true,
          },
        }),
      )
    } catch (error: any) {
      console.error('Sword upgrade error')
      socket.send(
        JSON.stringify({
          upgrade_sword_result: {
            message: 'Not enough AME in your wallet or max level reached.',
            status: false,
          },
        }),
      )
    }
  }

  return { exchange, upgradePickaxe, upgradeSword }
}

export default Web3
