import { Game } from '../engine/core/game.js';
import { Camera } from '../engine/core/camera.js';
import { Player } from './entities/player.js';
import { Colliders } from '../engine/core/colliders.js';
import { Cave } from './components/Cave.js';
import { Network } from './managers/network.js';
import { Rivals } from './managers/rivals.js';
import { env, grid, sprites, tileSize } from './config.js';
import UI from './components/UI.js';
import ConvertToGrid from './components/ConvertToGrid.js';
import Tilemap from './components/Tilemap.js';
import Wallet from './components/Wallet.js';
import Shop from './components/Shop.js';
const { address } = await Wallet();
const ws = new Network();
await ws.registration();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
if (!ctx)
    throw new Error('Canvas not found');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false;
const game = new Game();
const colliders = new Colliders(ConvertToGrid(grid.forest.cliff), tileSize);
const cave = new Cave(ctx, ConvertToGrid(grid.cave.ground), env.cave.position, colliders, ws);
const player = new Player(ctx, sprites.player, colliders, cave, (color) => background(color));
const rivals = new Rivals(ctx);
const tilemap = Tilemap(ctx);
const shop = Shop(ctx, canvas, address, ws, () => player.inventory);
const camera = new Camera({
    width: canvas.width,
    height: canvas.height,
    smooth: 0.04,
});
const { itemsBar, counter, background } = UI(ctx, canvas);
player.go(808, 384);
player.inventory.check(address);
game.update(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tilemap.draw('Cave', 0, camera.offset, env.cave.position);
    tilemap.draw('Forest', 0, camera.offset);
    tilemap.draw('Forest', 1, camera.offset);
    cave.build(camera.offset);
    rivals.initialize(ws.players);
    rivals.start(camera.offset);
    player.initialize();
    tilemap.draw('Forest', 2, camera.offset);
    camera.follow(player.position.local);
    ws.send({ player: player.getData() });
    itemsBar(player.inventory.get());
    counter();
    shop.updateAmethysts();
    shop.render(player.position.local);
    player.position.global = player.position.local.sub(camera.offset);
});
game.loop();
