import { Container, Point } from 'pixi.js';
import { getRelativeEvtPos } from '../../utils';

const SCROLL_SPEED = 0.1;
export class PixiZoomPanContainer extends Container {
  private xZoomOffset: number;
  private yZoomOffset: number;
  private dragging: boolean;
  private dragPos: Point;
  private wrapper: HTMLElement;

  constructor(wrapper: HTMLElement) {
    super();
    this.eventMode = 'static';
    this.xZoomOffset = 0;
    this.yZoomOffset = 0;
    this.wrapper = wrapper;

    // this.wrapper.on("wheel", this.onZoom.bind(this));
    this.sortableChildren = true;
    this.wrapper.addEventListener('wheel', this.onZoom.bind(this));
    this.wrapper.addEventListener('mousedown', this.onDragStart.bind(this));
    this.wrapper.addEventListener('mouseup', this.onDragEnd.bind(this));
    this.wrapper.addEventListener('mousemove', this.onDragMove.bind(this));
    this.wrapper.addEventListener('mouseout', this.onDragEnd.bind(this));
    this.dragging = false;
    this.dragPos = new Point(-1, -1);
    this.position.y = 40;
    this.position.x = this.wrapper.clientWidth / 2;
    this.xZoomOffset = this.position.x;
    this.yZoomOffset = this.position.y;
  }

  public snapBack() {
    this.setTransform(0, 0, 1, 1);
  }

  private onDragStart(event: MouseEvent) {
    this.dragging = true;
    const { x, y } = getRelativeEvtPos(event);
    this.dragPos = new Point(x, y);
  }

  private onDragMove(event: MouseEvent) {
    if (this.dragging) {
      const { x, y } = getRelativeEvtPos(event);
      const xPos = x - this.dragPos.x;
      const yPos = y - this.dragPos.y;

      this.dragPos = new Point(x, y);
      this.xZoomOffset = this.position.x + xPos;
      this.yZoomOffset = this.position.y + yPos;
      this.position.x = this.xZoomOffset;
      this.position.y = this.yZoomOffset;
    }
  }

  private onDragEnd() {
    this.dragging = false;
  }

  private onZoom(ev: WheelEvent) {
    ev.preventDefault();
    const { x, y } = getRelativeEvtPos(ev);
    const newScale = Math.round(this.scale.x * (1 + this.zoomDirection(ev) * SCROLL_SPEED) * 100) / 100;

    this.xZoomOffset = (this.xZoomOffset - x) * (newScale / this.scale.x) + x;
    this.yZoomOffset = (this.yZoomOffset - y) * (newScale / this.scale.x) + y;
    this.setTransform(this.xZoomOffset, this.yZoomOffset, newScale, newScale);
    console.log(newScale);
  }

  private zoomDirection(evt: WheelEvent) {
    return evt.deltaY > 0 ? -1 : 1;
  }
}
