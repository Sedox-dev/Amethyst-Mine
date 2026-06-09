export class Network {
    constructor() {
        this.playerId = null;
        this.players = {};
        this.store = {};
        this.mined = new Set();
        this.ws = new WebSocket('http://localhost:8080');
        this.status = null;
        this.ws.addEventListener('open', () => {
            this.status = true;
            console.log('Socket is connected');
        });
        this.ws.addEventListener('message', ({ data }) => {
            if (!this.status)
                return;
            const result = JSON.parse(data);
            if (result.login) {
                this.playerId = result.login.id;
            }
            if (result.players && this.playerId) {
                delete result.players[this.playerId];
                this.players = result.players;
            }
            if (result.mined) {
                this.mined = new Set(result.mined);
            }
            if (result.restored) {
                for (let i = 0; i < result.restored; i++) {
                    this.mined.delete(result.restored[i]);
                }
            }
            if (result.upgrade_sword_result) {
                this.store['upgrade_sword_result'] = result.upgrade_sword_result;
            }
            if (result.upgrade_pickaxe_result) {
                this.store['upgrade_pickaxe_result'] = result.upgrade_pickaxe_result;
            }
        });
        this.ws.addEventListener('close', () => {
            this.status = false;
            throw new Error('Connection to the server was interrupted');
        });
    }
    send(data) {
        if (!this.status)
            return;
        this.ws.send(JSON.stringify(data));
    }
    async listen(eventName) {
        let result = null;
        while (!result) {
            await new Promise((res) => setTimeout(() => {
                if (this.store[eventName] !== undefined) {
                    result = this.store[eventName];
                    delete this.store[eventName];
                }
                res();
            }, 500));
        }
        return result;
    }
    async registration() {
        while (this.playerId === null && this.status) {
            await new Promise((res) => setTimeout(res, 100));
        }
    }
}
