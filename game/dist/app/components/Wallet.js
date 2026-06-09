import { useWallet } from '../hooks/useWallet.js';
const Wallet = async () => {
    const ui = document.getElementById('ui');
    const canvas = document.getElementById('canvas');
    const walletBtn = document.getElementById('connect-wallet');
    const guestBtn = document.getElementById('as-guest');
    const wallet = useWallet();
    const connect = async () => {
        while (wallet.status !== 'approved') {
            await new Promise((res) => setTimeout(res, 100));
        }
        ui.remove();
        canvas.style = 'display: block';
    };
    walletBtn.addEventListener('click', wallet.connect);
    guestBtn.addEventListener('click', wallet.connectAsGuest);
    await connect();
    return wallet;
};
export default Wallet;
