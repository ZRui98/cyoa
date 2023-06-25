import type { Node } from '@backend/models/Node'
import { Text, TextStyle } from 'pixi.js'
import { currentActiveNode } from '../../store/adventure'
import { SmoothGraphics } from '@pixi/graphics-smooth'
import { NODE_HEIGHT, NODE_WIDTH } from './constants'

export class NodeGraphics extends SmoothGraphics {
    private node: Node
    private titleText: Text
    private isActive: boolean
    private id: string
    constructor(id: string, node: Node, x = 0, y = 0) {
        super()
        this.id = id
        this.isActive = false
        this.node = node
        this.eventMode = 'static'
        this.cursor = 'pointer'
        this.on('pointerdown', this.onPointerDown).on(
            'pointerup',
            this.onPointerUp
        )
        this.x = x
        this.y = y
        this.titleText = new Text(
            this.node.name,
            new TextStyle({
                fill: 0xe0def4,
            })
        )
        this.draw()
        currentActiveNode.subscribe((activeId: string | undefined) => {
            const newIsActive = activeId === this.id
            if (newIsActive !== this.isActive) {
                this.isActive = activeId === this.id
                this.draw()
            }
        })
    }

    draw() {
        const color = this.isActive ? 0xeb6f92 : 0xe0def4
        if (this.isActive) {
            this.beginFill(color, 1.0, true)
        } else {
            this.beginFill(0x191724, 1.0, true)
        }
        this.lineStyle(5, color, 1.0)
        this.drawRoundedRect(0, 0, NODE_WIDTH, NODE_HEIGHT, 5)
        this.endFill()
        this.titleText.anchor.set(0.5, 0)
        this.titleText.x = this.width / 2
        this.titleText.y = 10
        this.titleText.style.wordWrap = true
        this.titleText.style.wordWrapWidth = NODE_WIDTH - 20
        this.addChild(this.titleText)
    }

    onPointerDown() {
        currentActiveNode.set(this.id);
    }

    onPointerUp() {
        return
    }
}
