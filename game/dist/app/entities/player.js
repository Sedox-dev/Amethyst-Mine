import { Animator } from '../../engine/core/animator.js';
import { Keyboard } from '../../engine/input/keyboard.js';
import { Vector2 } from '../../engine/math/vector2.js';
import { Entity } from './entity.js';
import { env, scale, tileSize } from '../config.js';
import Inventory from '../components/Inventory.js';
export class Player extends Entity {
    constructor(ctx, sprites, collider, cave, uiBackground) {
        super();
        this.inventory = Inventory();
        this.sprites = sprites;
        this.keyboard = new Keyboard();
        this.animator = new Animator(ctx, this.direction, sprites);
        this.collider = collider;
        this.cave = cave;
        this.speed = 6;
        this.clip = 'Idle';
        this.lastMoveTime = performance.now();
        this.uiBackground = uiBackground;
    }
    initialize() {
        this.move();
        this.attack();
        this.toCave();
    }
    getData() {
        return {
            position: {
                x: +this.position.local.x.toFixed(3),
                y: +this.position.local.y.toFixed(3),
            },
            directions: {
                direction: this.direction,
                last: new Vector2().dirToVector2(this.animator.lastDir) || new Vector2(0, 1),
            },
            amethysts: this.inventory.get()?.amethysts?.count || 0,
            clip: this.clip,
        };
    }
    move() {
        const currentTime = performance.now();
        const dt = (currentTime - this.lastMoveTime) / 1000;
        this.lastMoveTime = currentTime;
        const cappedDt = Math.min(dt, 0.1) * 60;
        this.direction.x = 0;
        this.direction.y = 0;
        const { isDown } = this.keyboard;
        if (isDown('KeyW') || isDown('ArrowUp'))
            this.direction.y = -1;
        if (isDown('KeyS') || isDown('ArrowDown'))
            this.direction.y = 1;
        if (isDown('KeyA') || isDown('ArrowLeft'))
            this.direction.x = -1;
        if (isDown('KeyD') || isDown('ArrowRight'))
            this.direction.x = 1;
        if (!this.animator.unstoppable) {
            this.clip = Math.hypot(this.direction.x, this.direction.y) === 0 ? 'Idle' : 'Walk';
        }
        this.animator.play(this.clip, scale, this.position.global);
        const cell = this.collider.nextByDot(this.position.local, this.direction, 2);
        if (cell.isCollider || this.animator.unstoppable)
            return;
        if (Math.hypot(this.direction.x, this.direction.y) > 1) {
            this.position.local.x += ((this.direction.x * this.speed) / Math.sqrt(2)) * cappedDt;
            this.position.local.y += ((this.direction.y * this.speed) / Math.sqrt(2)) * cappedDt;
        }
        else {
            this.position.local.x += this.direction.x * this.speed * cappedDt;
            this.position.local.y += this.direction.y * this.speed * cappedDt;
        }
    }
    attack() {
        if (this.keyboard.isDown('0') && !this.animator.unstoppable) {
            const { coordinate } = this.collider.get(this.position.local);
            this.clip = 'Mine';
            const direction = new Vector2().dirToVector2(this.animator.lastDir);
            let targetX = coordinate.x + direction.x;
            let targetY = coordinate.y + direction.y;
            if (direction.y === -1) {
                const current = Math.floor(this.position.local.y / Math.round(tileSize * 0.33));
                if (coordinate.y < current)
                    targetY += 1;
            }
            const target = new Vector2(targetX, targetY);
            const event = () => {
                const cell = this.cave.getCell(target);
                if (cell?.type === 2) {
                    const amethysts = {
                        name: 'amethysts',
                        type: 'amethysts',
                        count: 1,
                    };
                    this.inventory.add(amethysts, 1 * +(this.inventory.get()?.pickaxe.level || 1));
                    this.cave.deleteCell(target);
                    this.collider.set(target);
                }
            };
            this.animator.play('Mine', scale, this.position.global, {
                index: 2,
                callback() {
                    event();
                },
            });
        }
    }
    toCave() {
        const cell = this.collider.get(this.position.local).coordinate;
        if (cell.isEqual(new Vector2(10, 3)) || cell.isEqual(new Vector2(9, 3))) {
            const { x, y } = env.cave.entry;
            this.go(x, y);
            this.uiBackground('#0a0a0f');
        }
        else if (new Set(['-81,28', '-80,28', '-79,28', '-78,28']).has(`${cell.x},${cell.y}`)) {
            const { x, y } = env.cave.exit;
            this.go(x, y);
            this.uiBackground('#f2d6ff');
        }
    }
}
