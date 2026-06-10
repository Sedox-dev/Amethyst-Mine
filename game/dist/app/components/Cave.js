import { Vector2 } from '../../engine/math/vector2.js';
import { Draw } from './Draw.js';
import { textures, tileSize, env } from '../config.js';
var CellType;
(function (CellType) {
    CellType[CellType["NONE"] = 0] = "NONE";
    CellType[CellType["CLIFF"] = 1] = "CLIFF";
    CellType[CellType["CRISTAL"] = 2] = "CRISTAL";
    CellType[CellType["EMPTY"] = 3] = "EMPTY";
})(CellType || (CellType = {}));
export class Cave {
    constructor(ctx, grid, position, colliders, ws) {
        this.path = textures.tilemap.cave.path;
        this.grid = [];
        this.ctx = ctx;
        this.position = position;
        this.colliders = colliders;
        this.ws = ws;
        this.draw = new Draw(ctx);
        this.groundTileIndex = new Set([1, 2, 3, 4]);
        this.spawnArea = new Set(['-81,28', '-80,28', '-79,28', '-78,28']);
        this.spawn(new Vector2(-85, -74), new Vector2(22, 27));
        for (let x = 0; x < grid.length; x++) {
            this.grid[x] = [];
            for (let y = 0; y < grid[x].length; y++) {
                const coordinate = new Vector2(Math.round((y * tileSize + this.position.x) / tileSize), Math.round((x * tileSize + this.position.y) / tileSize));
                const value = grid[x][y];
                const key = `${coordinate.x},${coordinate.y}`;
                this.grid[x][y] = new Cell(value, this.groundTileIndex.has(value) ? CellType.CRISTAL : CellType.CLIFF, coordinate, !this.spawnArea.has(key));
            }
        }
        colliders.add(this.getColliders());
    }
    build(offset) {
        for (let x = 0; x < this.grid.length; x++) {
            for (let y = 0; y < this.grid[x].length; y++) {
                const cell = this.grid[x][y];
                if (!this.groundTileIndex.has(cell.value))
                    continue;
                if (this.ws.status && this.ws.mined.has(`${cell.coordinate.x},${cell.coordinate.y}`)) {
                    cell.type = CellType.EMPTY;
                    cell.colider = false;
                    continue;
                }
                if (this.ws.status && cell.type === CellType.EMPTY) {
                    cell.type = CellType.CRISTAL;
                    cell.colider = true;
                    this.colliders.add([cell]);
                }
                const pointX = Math.round((y * tileSize + this.position.x) / tileSize);
                const pointY = Math.round((x * tileSize + this.position.y) / tileSize);
                const key = `${pointX},${pointY}`;
                if (this.grid[x][y].type === CellType.EMPTY)
                    continue;
                if (this.spawnArea.has(key)) {
                    const cell = this.grid[x][y];
                    if (cell.type !== CellType.NONE) {
                        cell.value = 0;
                        cell.type = CellType.NONE;
                    }
                    continue;
                }
                const posX = Math.round(y * tileSize + this.position.x - offset.x);
                const posY = Math.round(x * tileSize + this.position.y - offset.y);
                this.draw.tile(this.path, posX, posY, 16, 16);
                const cellBelow = this.grid[x + 1][y];
                if (cellBelow.type === CellType.CRISTAL || cellBelow.type === CellType.CLIFF)
                    continue;
                this.draw.tile(this.path, posX, posY + tileSize, 16, 32);
            }
        }
        this.colliders.setByString(this.ws.mined);
    }
    getCell(coordinate) {
        const pointX = Math.round(coordinate.y - env.cave.position.y / tileSize);
        const pointY = Math.round(coordinate.x - env.cave.position.x / tileSize);
        if (this.grid[pointX]) {
            if (this.grid[pointX][pointY]) {
                return this.grid[pointX][pointY];
            }
        }
        return null;
    }
    deleteCell(coordinate) {
        const pointX = Math.round(coordinate.y - env.cave.position.y / tileSize);
        const pointY = Math.round(coordinate.x - env.cave.position.x / tileSize);
        if (this.grid[pointX]) {
            if (this.grid[pointX][pointY]) {
                this.ws.send({ delete_cell: { cell: this.grid[pointX][pointY] } });
                this.grid[pointX][pointY].type = CellType.EMPTY;
            }
        }
    }
    getEmptyCells() {
        return this.grid.flat().filter((cell) => cell.type === CellType.EMPTY);
    }
    getColliders() {
        return this.grid.flat().filter((cell) => cell.colider);
    }
    spawn(pointX, pointY) {
        for (let x = pointX.x; x <= pointX.y; x++) {
            for (let y = pointY.x; y <= pointY.y; y++) {
                this.spawnArea.add(`${x},${y}`);
            }
        }
    }
}
class Cell {
    constructor(value, type, coordinate, colider = true) {
        this.value = value;
        this.type = type;
        this.coordinate = coordinate;
        this.colider = colider;
        this.count = 1;
    }
}
