import { Color } from "three";

export const getColorHash = (color: Color) => {
    return `${Math.floor(color.r * 255)}_${Math.floor(color.g * 255)}_${Math.floor(color.b * 255)}`
}