import { Assets, Sprite, Point } from "pixi.js";

export class PixiButton extends Sprite {
    private onClick?: () => void;
    constructor(resourceUrl: string, onClick?: () => void) {
        super();
        this.onClick = onClick;
        this.eventMode = 'static';
        this.onmouseenter = this.hover;
        this.onmousedown = this.click;
        this.onmouseup = this.hover;
        this.onmouseleave = this.normal;
        this.load(resourceUrl);
    }

    private async load(resourceUrl: string) {
        const texture = await Assets.load(resourceUrl);
        console.log(texture);
        this.texture = texture;
        this.scale = new Point(1.2, 1.2);
        this.normal();
    }

    protected hover() {
        this.tint = 0xaaaaaa;
    }

    protected click() {
        this.tint = 0xffffff;
        if (this.onClick) this.onClick();
    }

    protected normal() {
        this.tint = 0x999999;
    }
}