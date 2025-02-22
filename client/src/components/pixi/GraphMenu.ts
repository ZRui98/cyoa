import { Assets, Container, Texture, Point, Sprite, Graphics } from "pixi.js";
import { PixiButton } from "./PixiButton";
import { PixiToggleButton } from "./PixiToggleButton";


export class GraphMenu extends Container {
    private wrapper: HTMLElement;
    constructor(wrapper: HTMLElement) {
        super();
        this.eventMode = 'static';
        this.wrapper = wrapper;

        // this.wrapper.on("wheel", this.onZoom.bind(this));
        this.sortableChildren = true;
        this.position.y = 15;
        this.position.x = 20;
        this.load();
    }

    load() {
        const nodeButton = new PixiToggleButton('/icons/node.png');
        // s.mask = mask;
        nodeButton.x = 20;
        nodeButton.y = 0;
        this.addChild(nodeButton);
        const arrowButton = new PixiToggleButton('/icons/arrow.png');
        // s.mask = mask;
        arrowButton.x = 60;
        arrowButton.y = 0;
        this.addChild(arrowButton);
    }

}