import { GameAnimation, GameAnimationFunction } from "./Animation.model";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../../utils/Common.utils";

export class AnimationTimeline {
    private animations: GameAnimationFunction[] = [];
    constructor(private duration: number) {

    }

    setAnimation(animation: GameAnimationFunction) {
        this.animations.push(animation);
    }

    start() {
        return new Promise(resolve => {
            const id = requestAnimationFrames((passedMs, delta) => {
                const interpolationParam = passedMs / this.duration;
                for (const anim of this.animations) {
                    anim(interpolationParam, delta);
                }
                if (interpolationParam >= 1) {
                    cancelRequestAnimationFrames(id)
                }
            })
        })
    }
}