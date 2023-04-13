import type { Node } from "@backend/Node";
import { PixiGraphics } from "./PixiGraphics";
import { Text } from "pixi.js";
import { currentActiveNode } from "../../store/adventure";

export class NodeGraphics extends PixiGraphics{
  private node: Node;
  private titleText: Text;
  private isActive: boolean;
  private id: string;
  constructor(id: string, node: Node, x = 0, y = 0) {
    super();
    this.id = id;
    this.isActive = false;
    this.node = node;
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this
      .on('pointerdown', this.onPointerDown)
      .on('pointerup', this.onPointerUp);
    this.x = x;
    this.y = y;
    this.titleText = new Text(this.node.name);
    this.draw();
    currentActiveNode.subscribe((activeId: string | undefined) => {
      this.isActive = activeId === this.id;
      console.log("update detected", this.isActive, activeId, this.id);
    });
  }

  draw() {
    this.beginFill(0xEB6F92);
    this.drawRoundedRect(0, 0, 250, 130, 5);
    this.endFill();
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = this.width/2;
    this.titleText.y = 10;
    this.titleText.style.wordWrap = true;
    this.titleText.style.wordWrapWidth = 230;
    this.addChild(this.titleText);
  }

  onPointerDown() {
    this.isActive = true;
    return;
  }

  onPointerUp() {
    return;
  }
}