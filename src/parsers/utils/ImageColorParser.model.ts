import { Vector2, Color } from "three";
import { getColorHash } from "../../utils/Color.utils";

const isParsableColor = (color: Color) => {
    if (color.r === 1 && color.g === 1 && color.b === 1) {
        return false;
    }
    if (color.r === 0 && color.g === 0 && color.b === 0) {
        return false;
    }
    return /(0|255|100)_(0|255|100)_(0|255|100)/.test(getColorHash(color));
}

class ImageSquare {
    colors: Color[] = [];
    constructor(readonly position: Vector2, readonly width: number, readonly height: number) {

    }

    intersect(point: Vector2) {
        return point.x >= this.position.x && point.y >= this.position.y && point.x < (this.position.x + this.width) && point.y < (this.position.y + this.height);
    }
}

export class ImageModelParser {

    private squares: ImageSquare[] = [];

    constructor(private imageData: ImageData, private widthCount: number, private heightCount: number) {
        this.initialize();
    }

    private initialize() {
        const squareWidth = this.imageData.width / this.widthCount;
        const squareHeight = this.imageData.height / this.heightCount;
        for (let y = 0; y < this.heightCount; y++) {
            for (let x = 0; x < this.widthCount; x++) {
                const squareTopCoords = new Vector2(x * squareWidth, y * squareHeight);
                const imgSquare = new ImageSquare(squareTopCoords, squareWidth, squareHeight);
                this.setColors(imgSquare);
                this.squares.push(imgSquare);
            }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.imageData.width;
        canvas.height = this.imageData.height;
        ctx.putImageData(this.imageData, 0, 0);
        document.body.appendChild(canvas);
    }

    private setColors(square: ImageSquare) {
        const { position, width, height } = square;
        const colors: Color[] = [];
        let processedColorsHash: string[] = [];
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const x = position.x + i, y = position.y + j;
                const imageIndex = (Math.floor(y) * Math.floor(this.imageData.width) + Math.floor(x)) * 4;
                const r = this.imageData.data[imageIndex];
                const g = this.imageData.data[imageIndex + 1];
                const b = this.imageData.data[imageIndex + 2];
                const a = this.imageData.data[imageIndex + 3];
                if(a !== 255) {
                    continue;
                }
                const color = new Color(r / 255, g / 255, b / 255);
                const colorHash = getColorHash(color);
                if (!processedColorsHash.includes(colorHash) && isParsableColor(color)) {
                    colors.push(color);
                    processedColorsHash.push(colorHash);
                }
            }
        }
        square.colors = colors;
    }

    getRegionsWithColors(colorsList: Color[]) {
        const colorHashList = colorsList.map(color => getColorHash(color))
        return this.squares.filter(square => {
            return colorHashList.every(colorHash => {
                return square.colors.some(color => getColorHash(color) === colorHash);
            })
        })
    }

    getColorsForPoint(point: Vector2) {
        const targetSquare = this.squares.find(square => square.intersect(point));
        if (targetSquare) {
            return targetSquare.colors;
        } else {
            return [];
        }
    }
}