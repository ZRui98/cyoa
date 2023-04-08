import type { Node } from "/Node";
import { PixiGraphics } from "./PixiGraphics";

export class NodeGraphics extends PixiGraphics{
  private node: Node;
  constructor(node: Node, x = 0, y = 0) {
    super();
    this.node = node;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this
      .on('pointerdown', this.onPointerDown)
      .on('pointerup', this.onPointerUp);
    this.beginFill(0xDE3249);
    this.drawRect(x, y, 100, 100);
    this.endFill();
  }

  onPointerDown() {
    return;
  }

  onPointerUp() {
    return;
  }
}