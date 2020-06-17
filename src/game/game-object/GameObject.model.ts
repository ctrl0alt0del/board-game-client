import { Mesh, Matrix4, Object3D, Box3 } from "three";
import { Subject } from "rxjs";
import { GameAnimation, GameAnimationTickFunction } from "./animation/Animation.model";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";

export abstract class GameObject {

    protected initialMatrix: Matrix4;

    protected _object: Object3D;

    protected animationQueue: GameAnimation[] = [];


    onAddedToScene = new Subject<void>();

    get height() {
        const box = this.boundingBox;
        return box.max.z - box.min.z;
    }

    get boundingBox() {
        return new Box3().setFromObject(this.object3d);
    }


    get object3d() {
        if (!this._object) {
            this.initiateObject3d();
        }
        return this._object;
    }

    initiateObject3d(): void {
        const object = this.factoryMesh();
        if (this.initialMatrix) {
            object.applyMatrix4(this.initialMatrix);
            object.updateMatrixWorld();
        }
        this._object = object;
    }

    pushAnimation(tickFn: GameAnimationTickFunction, duration: number) {
        this.animationQueue.push({
            duration,
            tick: tickFn
        });
        if (this.animationQueue.length === 1) {
            this.playNextAnimation()
        }
    }

    waitAnimationQueue(){
        return new Promise(resolve => {
            this.pushAnimation(resolve, 0)
        })
    }

    setInitialMatrix(matrix: Matrix4) {
        this.initialMatrix = matrix;
    }
    abstract setReceiveShadowState(state: boolean);
    protected abstract factoryMesh(): Object3D;

    private playNextAnimation() {
        const [animation] = this.animationQueue;
        if(animation) {
            const id = requestAnimationFrames((passedMs, deltaMs)=>{
                animation.tick(passedMs, deltaMs);
                if(passedMs >= animation.duration) {
                    cancelRequestAnimationFrames(id);
                    this.animationQueue = this.animationQueue.filter(anim => anim !== animation);
                    this.playNextAnimation();
                }
            });
        }
    }


}