import { PixiButton } from "./PixiButton";

export class PixiToggleButton extends PixiButton {
    private selected = false;
    constructor(resoucreUrl: string, onClick?: () => void) {
        super(resoucreUrl, () => {this.selected = !this.selected; if (onClick) onClick()});
    }

    protected hover() {
        if (!this.selected) super.hover();
    }

    protected normal() {
        if (!this.selected) super.normal();
    }
}