import { Vector2 } from '../../engine/math/vector2.js';
export class Entity {
    constructor() {
        this.position = {
            local: new Vector2(),
            global: new Vector2(),
        };
        this.direction = new Vector2();
    }
    go(x, y) {
        this.position.local = new Vector2(x, y);
    }
}
