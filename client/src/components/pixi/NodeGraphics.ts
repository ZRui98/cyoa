import type { Node } from "@backend/Node";
import { Text, TextStyle } from "pixi.js";
import { currentActiveNode } from "../../store/adventure";
import { SmoothGraphics } from "@pixi/graphics-smooth";

export class NodeGraphics extends SmoothGraphics{
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
    this.x = x - 250 / 2;
    this.y = y - 130 / 2;
    this.titleText = new Text(this.node.name, new TextStyle({
      fill: 0xE0DEF4
    }
    ));
    this.draw();
    currentActiveNode.subscribe((activeId: string | undefined) => {
      const newIsActive = activeId === this.id;
      if (newIsActive !== this.isActive) {
        this.isActive = activeId === this.id;
        this.draw();
      }
    });
  }

  draw() {
    const color = this.isActive ? 0xEB6F92 : 0xE0DEF4;
    if (this.isActive) {
      this.beginFill(color, 1.0, true);
    } else {
      this.beginFill(0x191724, 1.0, true)
    }
    this.lineStyle(5, color, 1.0)
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
    currentActiveNode.set(this.id);
  }

  onPointerUp() {
    return;
  }
}