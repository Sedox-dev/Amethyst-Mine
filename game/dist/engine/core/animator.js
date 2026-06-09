export class Animator {
    constructor(ctx, direction, sprites) {
        this.unstoppable = false;
        this.cache = {};
        this.ctx = ctx;
        this.direction = direction;
        this.sprites = sprites;
        this.index = 0;
        this.time = 0;
        this.cooldown = 100;
        this.lastDir = null;
        this.currentClip = null;
        this.currentEvent = null;
    }
    play(clip, scale, position, event, frameSize = 48) {
        let dir = this.direction.toDir();
        if (!dir) {
            dir = this.lastDir ? this.lastDir : 'DOWN';
        }
        this.lastDir = dir;
        const path = this.sprites[dir][this.currentClip || clip];
        const image = this.cache[path] ? this.cache[path] : new Image();
        if (event != null) {
            this.unstoppable = true;
            this.currentClip = clip;
            this.currentEvent = event;
            this.index = 0;
        }
        if (!this.cache[path]) {
            image.src = path;
            this.cache[path] = image;
        }
        const frames = image.width / frameSize;
        const frame = this.index % frames;
        this.ctx.drawImage(image, frameSize * frame, 0, frameSize, frameSize, position.x - (frameSize * scale) / 2, position.y - (frameSize * scale) / 2, frameSize * scale, frameSize * scale);
        if (Date.now() >= this.time) {
            this.time = Date.now() + this.cooldown;
            this.index++;
            if (this.currentEvent?.index === frame && !!this.unstoppable) {
                this.currentEvent.callback();
            }
            if (frame === frames - 1) {
                this.unstoppable = false;
                this.currentClip = null;
                this.index = 0;
            }
        }
    }
}
