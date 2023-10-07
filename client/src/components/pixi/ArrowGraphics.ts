import { SmoothGraphics, DashLineShader } from '@pixi/graphics-smooth';
import { Point } from 'pixi.js';

const dashLineShader = new DashLineShader({ dash: 5, gap: 4 });

export class ArrowGraphics extends SmoothGraphics {
  private isDotted: boolean;
  private points: number[][];
  private color: number;
  private point: SmoothGraphics;
  constructor(points: number[][], isDotted: boolean) {
    super();
    this.points = points;
    this.isDotted = isDotted;
    this.point = new SmoothGraphics();
    this.addChild(this.point);
    if (this.isDotted) {
      this.color = 0xf6c177;
      this.lineStyle({
        width: 3,
        color: this.color,
        shader: dashLineShader,
      });
    } else {
      this.color = 0xe0def4;
      this.lineStyle(5, this.color);
    }
    this.draw();
  }

  draw() {
    this.moveTo(this.points[0][0], this.points[0][1]);
    if (this.points.length === 3) {
      this.quadraticCurveTo(this.points[1][0], this.points[1][1], this.points[2][0], this.points[2][1]);
    } else {
      this.bezierCurveTo(
        this.points[1][0],
        this.points[1][1],
        this.points[2][0],
        this.points[2][1],
        this.points[3][0],
        this.points[3][1]
      );
    }

    const lastPoint = this.points[this.points.length - 1];
    const secondLastPoint = this.points[this.points.length - 2];
    const y = lastPoint[1] - secondLastPoint[1];
    const x = lastPoint[0] - secondLastPoint[0];
    const angle = Math.atan2(y, x);

    this.lineStyle(1, this.color);
    this.moveTo(lastPoint[0], lastPoint[1]);
    // this.addChild();
    this.point.beginFill(this.color);

    this.point.drawPolygon(new Point(-7, -6), new Point(-7, 6), new Point(5, 0));
    this.point.setTransform(lastPoint[0], lastPoint[1], 1, 1, angle, undefined, undefined, 0, 0);
    this.point.endFill();
  }
}
