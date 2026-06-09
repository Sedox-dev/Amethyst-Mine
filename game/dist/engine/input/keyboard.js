export class Keyboard {
    constructor() {
        this.keys = {};
        this.isDown = (key) => {
            return !!this.keys[key];
        };
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        window.addEventListener('mousedown', (e) => {
            this.keys[e.button] = true;
        });
        window.addEventListener('mouseup', (e) => {
            this.keys[e.button] = false;
        });
    }
}
