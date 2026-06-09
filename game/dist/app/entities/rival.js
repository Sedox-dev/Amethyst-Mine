import { Animator } from '../../engine/core/animator.js';
import { scale, sprites } from '../config.js';
import { Entity } from './entity.js';
export class Rival extends Entity {
    constructor(ctx, key) {
        super();
        this.key = key;
        this.animator = new Animator(ctx, this.direction, sprites.player);
    }
    draw(lastDir, clip) {
        this.animator.lastDir = lastDir.toDir();
        this.animator.play(clip, scale, this.position.local);
    }
}
