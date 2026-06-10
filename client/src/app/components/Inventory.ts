import { items } from '../config.js'
import Contract from '../managers/contract.js'

type Item = {
  name: string
  type: string
  count: number
  level?: number
}

const Inventory = () => {
  const contract = Contract()

  const inventory: Record<string, Item> = {
    sword: { ...items.sword },
    pickaxe: { ...items.pickaxe },
  }

  const get = () => inventory

  const add = (item: Item, amount: number = 1) => {
    const key = item.type

    if (inventory[key]) {
      inventory[key].count = inventory[key].count + amount
      return
    }

    inventory[key] = { ...item }
  }

  const decrement = (key: string, amount: number = 1) => {
    if (inventory[key] && typeof inventory[key].count === 'number' && inventory[key].count) {
      inventory[key].count = inventory[key].count - amount
    }
  }

  const check = (address: string | null) => {
    if (!address || address === 'guest') return

    contract.get('get_player_tools', [address]).then((res) => {
      inventory['pickaxe'].level = res[0]
      inventory['sword'].level = res[1]
    })
  }

  return { get, add, decrement, check }
}

export default Inventory
