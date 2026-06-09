export class Game {
    constructor() {
        this.callbacks = [];
        this.update = (fn) => {
            this.callbacks.push(fn);
        };
        this.loop = () => {
            for (const fn of this.callbacks) {
                fn();
            }
            requestAnimationFrame(this.loop);
        };
    }
}
