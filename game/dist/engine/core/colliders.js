import { Vector2 } from '../math/vector2.js';
export class Colliders {
    constructor(list, tileSize) {
        this.tileSize = tileSize;
        this.colliders = {};
        this.lastDir = new Vector2();
        for (let x = 0; x < list.length; x++) {
            for (let y = 0; y < list[x].length; y++) {
                if (list[x][y] <= 0)
                    continue;
                const key = `${y},${x}`;
                this.colliders[key] = 1;
            }
        }
    }
    add(list) {
        for (let i = 0; i < list.length; i++) {
            const cell = list[i];
            const key = `${cell.coordinate.x},${cell.coordinate.y}`;
            this.colliders[key] = 1;
        }
    }
    get(position) {
        const cell = new Vector2(Math.floor(position.x / this.tileSize), Math.floor(position.y / this.tileSize));
        const key = `${cell.x},${cell.y}`;
        return {
            coordinate: cell,
            isCollider: !!this.colliders[key],
        };
    }
    set(coordinate) {
        const key = `${coordinate.x},${coordinate.y}`;
        if (this.colliders[key]) {
            this.colliders[key] = 0;
        }
    }
    setByString(list) {
        for (const item of list) {
            this.colliders[item] = 0;
        }
    }
    next(position, direction) {
        const cell = new Vector2(Math.round(position.x / this.tileSize), Math.round(position.y / this.tileSize));
        let key = `${cell.x + (this.lastDir.x === 0 ? direction.x : this.lastDir.x)},${cell.y + (this.lastDir.y === 0 ? direction.y : this.lastDir.y)}`;
        if (direction.x !== 0 || direction.y !== 0) {
            this.lastDir.x = direction.x;
            this.lastDir.y = direction.y;
            if (Math.hypot(direction.x, direction.y) > 1) {
                this.lastDir.x = 0;
            }
            key = `${cell.x + this.lastDir.x},${cell.y + this.lastDir.y}`;
        }
        const target = new Vector2(cell.x + this.lastDir.x, cell.y + this.lastDir.y);
        return {
            coordinate: target,
            isCollider: !!this.colliders[key],
            direction: this.lastDir,
        };
    }
    nextByDot(position, direction, pivot = 0) {
        const cell = new Vector2(+((position.x + direction.x * (pivot * 5)) / this.tileSize).toFixed(1), +((position.y + 10 + direction.y * pivot) / this.tileSize).toFixed(1));
        const next = new Vector2(Math.floor(cell.x + direction.x * 0.1), Math.floor(cell.y + direction.y * 0.1));
        const key = `${next.x},${next.y}`;
        return {
            coordinate: next,
            isCollider: !!this.colliders[key],
        };
    }
}
