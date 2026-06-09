export class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    isEqual(v) {
        return this.x === v.x && this.y === v.y;
    }
    toDir() {
        const directions = {
            '-1,0': 'LEFT',
            '1,0': 'RIGHT',
            '0,-1': 'UP',
            '0,1': 'DOWN',
        };
        const key = `${this.x},${this.y}`;
        return directions[key];
    }
    dirToVector2(direction) {
        const directions = {
            LEFT: '-1,0',
            RIGHT: '1,0',
            UP: '0,-1',
            DOWN: '0,1',
        };
        if (!direction || !directions[direction]) {
            return null;
        }
        const dir = directions[direction].split(',');
        return new Vector2(+dir[0], +dir[1]);
    }
}
