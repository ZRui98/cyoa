import { SmoothGraphics, DashLineShader } from '@pixi/graphics-smooth'
import { Direction } from './constants'

const dashLineShader = new DashLineShader({ dash: 5, gap: 4 })

export class ArrowGraphics extends SmoothGraphics {
    private isSimple: boolean
    private points: number[][]
    private direction: Direction
    private color: number
    constructor(
        points: number[][],
        isSimple: boolean,
        direction: Direction = Direction.DOWN
    ) {
        super()
        this.isSimple = isSimple
        this.points = points
        this.direction = direction
        if (!this.isSimple) {
            this.color = 0xf6c177
            this.lineStyle({
                width: 3,
                color: this.color,
                shader: dashLineShader,
            })
        } else {
            this.color = 0xe0def4
            this.lineStyle(5, this.color)
        }
        this.draw()
    }

    draw() {
        let xDiff = 0
        let yDiff = 0
        switch (this.direction) {
            case Direction.DOWN:
                yDiff = 7
                break
            case Direction.UP:
                yDiff = -7
                break
            case Direction.RIGHT:
                xDiff = 7
                break
            case Direction.LEFT:
                xDiff = -7
                break
        }
        this.moveTo(this.points[0][0], this.points[0][1]);
        if (this.points.length === 3) {
            this.quadraticCurveTo(this.points[1][0], this.points[1][1], this.points[2][0], this.points[2][1]);
        } else {
            this.bezierCurveTo(this.points[1][0], this.points[1][1], this.points[2][0], this.points[2][1], this.points[3][0] + xDiff, this.points[3][1] + yDiff);
        }

        const lastPoint = this.points[this.points.length - 1];

        this.lineStyle(1, this.color)
        this.moveTo(lastPoint[0], lastPoint[1])
        this.beginFill(this.color)
        switch (this.direction) {
            case Direction.DOWN:
                this.lineTo(lastPoint[0] - 6, lastPoint[1] + 12)
                this.lineTo(lastPoint[0] + 6, lastPoint[1] + 12)
                this.lineTo(lastPoint[0], lastPoint[1])
                break
            case Direction.UP:
                this.lineTo(lastPoint[0] - 6, lastPoint[1] - 12)
                this.lineTo(lastPoint[0] + 6, lastPoint[1] - 12)
                this.lineTo(lastPoint[0], lastPoint[1])
                break
            case Direction.RIGHT:
                this.lineTo(lastPoint[0] + 12, lastPoint[1] - 6)
                this.lineTo(lastPoint[0] + 12, lastPoint[1] + 6)
                this.lineTo(lastPoint[0], lastPoint[1])
                break
            case Direction.LEFT:
                this.lineTo(lastPoint[0] - 12, lastPoint[1] + 6)
                this.lineTo(lastPoint[0] - 12, lastPoint[1] - 6)
                this.lineTo(lastPoint[0], lastPoint[1])
                break
        }
        this.endFill()
    }
}
