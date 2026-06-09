import { Tilemap as CreateTilemap } from '../../engine/core/tilemap.js';
import { tileSize, textures, grid } from '../config.js';
import { Vector2 } from '../../engine/math/vector2.js';
import ConvertToGrid from './ConvertToGrid.js';
const Tilemap = (ctx) => {
    const tilemap = new CreateTilemap(ctx, tileSize);
    tilemap.layers = {
        forest: {
            0: { grid: ConvertToGrid(grid.forest.ground), texturePath: textures.tilemap.forest.path },
            1: { grid: ConvertToGrid(grid.forest.cliff), texturePath: textures.tilemap.forest.path },
            2: { grid: ConvertToGrid(grid.forest.tree), texturePath: textures.tilemap.forest.path },
        },
        cave: {
            0: { grid: ConvertToGrid(grid.cave.ground), texturePath: textures.tilemap.cave.path },
        },
    };
    tilemap.tiles = {
        forest: {
            // Ground
            1: { offset: new Vector2(16, 32) },
            2: { offset: new Vector2(32, 32) },
            3: { offset: new Vector2(16, 48) },
            4: { offset: new Vector2(32, 48) },
            // Cliff
            5: { offset: new Vector2(112, 96) },
            6: { offset: new Vector2(112, 80) },
            7: { offset: new Vector2(112, 64) },
            8: { offset: new Vector2(128, 96) },
            9: { offset: new Vector2(128, 80) },
            10: { offset: new Vector2(144, 96) },
            11: { offset: new Vector2(144, 80) },
            12: { offset: new Vector2(160, 96) },
            13: { offset: new Vector2(160, 80) },
            14: { offset: new Vector2(160, 64) },
            15: { offset: new Vector2(112, 48) },
            16: { offset: new Vector2(160, 48) },
            17: { offset: new Vector2(192, 80) },
            18: { offset: new Vector2(32, 176) },
            19: { offset: new Vector2(80, 176) },
            20: { offset: new Vector2(128, 176) },
            // Tree
            21: { offset: new Vector2(16, 128) },
            22: { offset: new Vector2(32, 128) },
            23: { offset: new Vector2(48, 128) },
            24: { offset: new Vector2(16, 144) },
            25: { offset: new Vector2(32, 144) },
            26: { offset: new Vector2(48, 144) },
            27: { offset: new Vector2(16, 160) },
            28: { offset: new Vector2(32, 160) },
            29: { offset: new Vector2(48, 160) },
            30: { offset: new Vector2(64, 128) },
            31: { offset: new Vector2(80, 128) },
            32: { offset: new Vector2(96, 128) },
            33: { offset: new Vector2(64, 144) },
            34: { offset: new Vector2(80, 144) },
            35: { offset: new Vector2(96, 144) },
            36: { offset: new Vector2(64, 160) },
            37: { offset: new Vector2(80, 160) },
            38: { offset: new Vector2(96, 160) },
            39: { offset: new Vector2(112, 128) },
            40: { offset: new Vector2(128, 128) },
            41: { offset: new Vector2(144, 128) },
            42: { offset: new Vector2(112, 144) },
            43: { offset: new Vector2(128, 144) },
            44: { offset: new Vector2(144, 144) },
            45: { offset: new Vector2(112, 160) },
            46: { offset: new Vector2(128, 160) },
            47: { offset: new Vector2(144, 160) },
            48: { offset: new Vector2(64, 32) },
            49: { offset: new Vector2(80, 32) },
            50: { offset: new Vector2(64, 48) },
            51: { offset: new Vector2(80, 48) },
            52: { offset: new Vector2(64, 80) },
            53: { offset: new Vector2(80, 80) },
            54: { offset: new Vector2(64, 96) },
            55: { offset: new Vector2(80, 96) },
            56: { offset: new Vector2(112, 32) },
            57: { offset: new Vector2(128, 32) },
            58: { offset: new Vector2(160, 32) },
        },
        cave: {
            1: { offset: new Vector2(48, 0) },
            2: { offset: new Vector2(64, 0) },
            3: { offset: new Vector2(48, 16) },
            4: { offset: new Vector2(64, 16) },
            5: { offset: new Vector2(16, 64) },
            6: { offset: new Vector2(48, 48) },
            7: { offset: new Vector2(64, 48) },
            8: { offset: new Vector2(48, 64) },
            9: { offset: new Vector2(64, 64) },
        },
    };
    return tilemap;
};
export default Tilemap;
