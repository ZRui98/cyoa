import { SmoothGraphics, DashLineShader } from '@pixi/graphics-smooth';
import { Point } from 'pixi.js';
import type { Unsubscriber } from 'svelte/store';
import { currentActiveNode } from '../../store/adventure';

const dashLineShader = new DashLineShader({ dash: 5, gap: 4 });

const ARROW_TYPES = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE'
} as const;

type ArrowType = typeof ARROW_TYPES[keyof typeof ARROW_TYPES];

export class ArrowGraphics extends SmoothGraphics {
  private arrowType: ArrowType;
  private points: number[][];
  private point: SmoothGraphics;
  private unsub: Unsubscriber;
  private isDotted: boolean;
  private from: string;
  private to: string;
  constructor(points: number[][], isDotted: boolean, to: string, from: string) {
    super();
    this.points = points;
    this.arrowType = 'INACTIVE';
    this.isDotted = isDotted;
    this.from = from;
    this.to = to;
    this.point = new SmoothGraphics();
    this.addChild(this.point);
    this.draw();
    this.unsub = currentActiveNode.subscribe((activeNode: { id: string } | undefined) => {
      const isFromActive = activeNode?.id === this.from;
      const isToActive = activeNode?.id === this.to;
      let newState: ArrowType = 'INACTIVE';
      if (isFromActive || isToActive) {
        newState = 'ACTIVE';
      }
      if (newState !== this.arrowType) {
        this.arrowType = newState;
        this.draw();
      }
    });
  }

  destroy() {
    this.unsub();
    super.destroy();
  }

  draw() {
    this.clear();
    this.point.clear();
    if (this.isDotted) {
      this.lineStyle({
        width: 3,
        color: 0xf6c177,
        shader: dashLineShader,
      });
    } else {
      this.lineStyle(5, 0xe0def4);
    }
    let scale = 1;
    if (this.arrowType === 'ACTIVE') {
      scale = 1.5;
      this.zIndex = 100;
      this.lineStyle({
        width: this._lineStyle.width * scale,
        color: 0xc4a7e7,
        shader: this._lineStyle.shader
      });
    } else {
      this.zIndex = 0;
    }
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

    this.lineStyle(1, this._lineStyle.color);
    this.moveTo(lastPoint[0], lastPoint[1]);
    // this.addChild();
    this.point.beginFill(this._lineStyle.color);

    this.point.drawPolygon(new Point(-7 * scale, -6 * scale), new Point(-7 * scale, 6 * scale), new Point(5 * scale, 0));
    this.point.setTransform(lastPoint[0], lastPoint[1], 1, 1, angle, undefined, undefined, 0, 0);
    this.point.endFill();
  }
}
