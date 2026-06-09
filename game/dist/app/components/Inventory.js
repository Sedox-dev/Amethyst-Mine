import { items } from '../config.js';
import Contract from '../managers/contract.js';
const Inventory = () => {
    const contract = Contract();
    const inventory = {
        sword: { ...items.sword },
        pickaxe: { ...items.pickaxe },
    };
    const get = () => inventory;
    const add = (item, amount = 1) => {
        const key = item.type;
        if (inventory[key]) {
            inventory[key].count = inventory[key].count + amount;
            return;
        }
        inventory[key] = { ...item };
    };
    const decrement = (key, amount = 1) => {
        if (inventory[key] && typeof inventory[key].count === 'number' && inventory[key].count) {
            inventory[key].count = inventory[key].count - amount;
        }
    };
    const check = (address) => {
        if (!address || address === 'guest')
            return;
        contract.get('get_player_tools', [address]).then((res) => {
            inventory['pickaxe'].level = res[0];
            inventory['sword'].level = res[1];
            console.log(res);
        });
    };
    return { get, add, decrement, check };
};
export default Inventory;
