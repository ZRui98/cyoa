import { FederatedEvent, Text, TextStyle } from 'pixi.js';
import { currentActiveNode, type GraphNode } from '../../store/adventure';
import { SmoothGraphics } from '@pixi/graphics-smooth';
import { NODE_HEIGHT, NODE_WIDTH } from './constants';
import type { Unsubscriber } from 'svelte/store';

export class NodeGraphics extends SmoothGraphics {
  private node: GraphNode;
  private titleText: Text;
  private isActive: boolean;
  private id: string;
  private unsub: Unsubscriber;
  constructor(id: string, node: GraphNode, x = 0, y = 0) {
    super();
    this.id = id;
    this.isActive = false;
    this.node = node;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this.onPointerDown).on('pointerup', this.onPointerUp);
    this.onmousedown = (e: FederatedEvent) => {e.stopPropagation(); e.preventDefault();};
    this.onmousemove = (e: FederatedEvent) => {e.stopPropagation(); e.preventDefault();};
    this.x = x;
    this.y = y;
    this.titleText = new Text(
      this.node.name,
      new TextStyle({
        fill: 0xe0def4,
      })
    );
    this.draw();
    this.unsub = currentActiveNode.subscribe((activeNode: { id: string } | undefined) => {
      const newIsActive = activeNode?.id === this.id;
      if (newIsActive !== this.isActive) {
        this.isActive = activeNode?.id === this.id;
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
    const color = this.isActive ? 0xeb6f92 : 0xe0def4;
    if (this.isActive) {
      this.beginFill(color, 1.0, true);
    } else {
      this.beginFill(0x191724, 1.0, true);
    }
    this.lineStyle(5, color, 1.0);
    this.drawRoundedRect(0, 0, NODE_WIDTH, NODE_HEIGHT, 5);
    this.endFill();
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = this.width / 2;
    this.titleText.y = 10;
    this.titleText.style.wordWrap = true;
    this.titleText.style.wordWrapWidth = NODE_WIDTH - 20;
    this.addChild(this.titleText);
  }

  onPointerDown(e: FederatedEvent) {
    currentActiveNode.set(this.id);
  }

  onPointerUp(e: FederatedEvent) {
    return;
  }
}
