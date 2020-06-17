import { UILayout } from "./UILayout.model";
import { Vector2 } from "three";

export class CircleAroundLayout extends UILayout {
    constructor(public radius: number, public maxElements: number) {
        super();
    }

    getCoords(index: number) {
        const step = Math.PI / (this.maxElements - 1);
        const psi = (index ) * step - Math.PI / 2;
        const x = this.radius * Math.sin(psi);
        const y = this.radius * Math.cos(psi);
        return new Vector2(x, y)
    }
}