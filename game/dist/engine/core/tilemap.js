import { Vector2 } from '../math/vector2.js';
export class Tilemap {
    constructor(ctx, tileSize) {
        this.tiles = {};
        this.layers = {};
        this.cache = {};
        this.ctx = ctx;
        this.tileSize = tileSize;
    }
    draw(folder, layerIndex, cameraOffset, tileOffset = new Vector2()) {
        if (!this.layers[folder.toLowerCase()])
            throw new Error(`Folder: ${folder} not found`);
        const layer = this.layers[folder.toLowerCase()][layerIndex];
        for (let x = 0; x < layer.grid.length; x++) {
            for (let y = 0; y < layer.grid[1].length; y++) {
                if (layer.grid[x][y] == 0)
                    continue;
                this.drawTile(layer.texturePath, new Vector2(Math.round(y * this.tileSize + tileOffset.x - cameraOffset.x), Math.round(x * this.tileSize + tileOffset.y - cameraOffset.y)), this.tiles[folder.toLowerCase()][layer.grid[x][y]].offset);
            }
        }
    }
    drawTile(path, position, offset) {
        const image = this.cache[path] || new Image();
        if (!image.src) {
            image.src = path;
            this.cache[path] = image;
        }
        this.ctx.drawImage(image, offset.x, offset.y, 16, 16, position.x, position.y, this.tileSize, this.tileSize);
    }
}
