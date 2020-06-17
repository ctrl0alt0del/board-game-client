import { Texture } from "three";

export const getImageData = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = img;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, width, height);
}

export const createEmptyTexture = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    return new Texture(canvas);
}