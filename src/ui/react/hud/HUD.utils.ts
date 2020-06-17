import { lerpNumbers } from "../../../utils/Common.utils";

const originalWidth = 3072;
const originalHeight = 1728;

export const initialHUDSize = {
    width: originalWidth,
    height: originalHeight
}

export const getUIHUDTransform = () => {
    const { innerWidth, innerHeight } = window;
    return { scaleX: innerWidth / originalWidth, scaleY: innerHeight / originalHeight, translateX: 0, translateY: 0 }
}