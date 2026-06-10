import { point, scope, tileSize } from '../config.js';
export class Draw {
    constructor(ctx) {
        this.ctx = ctx;
        this.cache = {};
    }
    tile(path, posX, posY, offsetX, offsetY) {
        const x = Math.round(posX / tileSize);
        const y = Math.round(posY / tileSize);
        const playerX = Math.round(point.x / tileSize);
        const playerY = Math.round(point.y / tileSize);
        if (Math.abs(x - playerX) > scope.x || Math.abs(y - playerY) > scope.y)
            return;
        const image = this.cache[path] || new Image();
        if (!image.src) {
            image.src = path;
            this.cache[path] = image;
        }
        this.ctx.drawImage(image, offsetX, offsetY, 16, 16, posX, posY, tileSize, tileSize);
    }
}
