import { Vector2 } from '../../engine/math/vector2.js';
import { Rival } from '../entities/rival.js';
export class Rivals {
    constructor(ctx) {
        this.ctx = ctx;
        this.store = {};
        this.data = {};
    }
    initialize(players) {
        this.data = players;
        for (const key in players) {
            if (!this.store[key]) {
                this.store[key] = new Rival(this.ctx, key);
            }
        }
    }
    start(offset) {
        Object.values(this.store).forEach((rival) => {
            const info = this.data[rival.key];
            if (!info || !info.position)
                return;
            const position = new Vector2(info.position.x | 0, info.position.y | 0);
            const lastDir = new Vector2(info.directions.last.x | 0, info.directions.last.y | 0);
            rival.position.local = position.sub(offset);
            rival.draw(lastDir, info.clip);
        });
    }
}
