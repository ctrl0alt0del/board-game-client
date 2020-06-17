import { BufferGeometry } from "three";

export class GeometryUtils {
    static *getVerticesFfromBufferGeometry(geometry: BufferGeometry) {
        const positionArray = geometry.attributes.position.array;
        for(let i = 0; i < positionArray.length; i+=3){
            yield [positionArray[i], positionArray[i+1],positionArray[i+2]] as [number, number, number];
        }
    }
}