import { Vector2 } from "three";
import { randomBetween as rand } from "../../../../../utils/Common.utils";

export class SpeedLineDrawer {
    private speed = rand(2, 4);
    private life = rand(500, 900);
    private curLife = this.life;
    private alpha = rand(.25, 1);
    private angle = Math.PI * rand(0, 2);
    private size = rand(20, 40);
    private inRadius = rand(200, 400);
    private outRadius: number;

    get dead() {
        return this.curLife < 0;
    }

    constructor(private position: Vector2, private ctx: CanvasRenderingContext2D) {
        this.outRadius = ctx.canvas.width;
    }

    update() {
        this.curLife -= this.speed;
        this.inRadius += this.speed * 4;

        this.alpha *= (this.curLife / this.life);
        this.size *= (this.curLife / this.life);

        this.draw();
    }

    draw() {
        const { position: { x, y }, size, angle, alpha } = this,
            { inRadius, outRadius } = this;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        this.ctx.beginPath();
        this.ctx.moveTo(0, inRadius);
        this.ctx.lineTo(size, outRadius);
        this.ctx.lineTo(-size, outRadius);
        this.ctx.closePath();

        this.ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
        this.ctx.fill();
        this.ctx.restore();
    }
}

type Size = {
    width: number;
    height: number;
};

export class SpeedLineManager {
    private lines: SpeedLineDrawer[] = [];
    constructor(linesCount: number, private ctx: CanvasRenderingContext2D, {width, height}: Size) {
        for (let i = 0; i < linesCount; i++) {
            this.lines[i] = new SpeedLineDrawer(new Vector2(width / 2, height / 2), ctx);
        }
    }

    update({width, height}: Size) {
        this.lines.forEach((line, i) => {
            if (!line || line.dead) this.lines[i] = new SpeedLineDrawer(new Vector2(width / 2, height / 2), this.ctx);
            this.lines[i].update();
        });
    }
}