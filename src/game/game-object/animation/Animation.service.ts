import { Injectable } from "injection-js";
import { AnimationTimeline } from "./AnimationTilemeline.model";

@Injectable()
export class AnimationService {
    private timelines: AnimationTimeline[] = [];
    execute(animationTimeline: AnimationTimeline) {
        this.timelines.push(animationTimeline);
        animationTimeline.start()
    }
}