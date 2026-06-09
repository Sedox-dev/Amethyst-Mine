import { Vector2 } from '../math/vector2.js';
export class Camera {
    constructor(camera) {
        this.firstRender = true;
        this.camera = {
            width: 0,
            height: 0,
            smooth: 0,
        };
        this.camera = camera;
        this.offset = new Vector2();
    }
    follow(target) {
        if (this.camera.smooth) {
            const x = target.x - this.camera.width / 2;
            const y = target.y - this.camera.height / 2;
            if (this.firstRender) {
                this.offset = new Vector2(x, y);
                this.firstRender = false;
            }
            this.offset.x += (x - this.offset.x) * this.camera.smooth;
            this.offset.y += (y - this.offset.y) * this.camera.smooth;
            return;
        }
        this.offset.x = target.x - this.camera.width / 2;
        this.offset.y = target.y - this.camera.height / 2;
    }
}
