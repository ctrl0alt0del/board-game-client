import { Subject } from "rxjs";

export class AnimationManager {
    private _nextAnimation = new Subject<string>();

    get nextAnimation() {
        return this._nextAnimation.asObservable();
    }
}