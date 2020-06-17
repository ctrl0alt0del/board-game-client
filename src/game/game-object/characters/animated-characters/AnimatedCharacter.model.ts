import { Character } from "../Character";
import { AnimationClip, SkinnedMesh, AnimationMixer, MeshPhysicalMaterial, Color, Texture, LoopOnce, LoopRepeat, AnimationAction, AnimationActionLoopStyles, LoopPingPong, BoxHelper } from "three";
import { requestAnimationFrames, getNestedMesh } from "../../../../utils/Common.utils";
import { ObjectsRenderingOrder } from "../../../GameConstants.utils";
import { SelectableGameObject } from "../../selectable/Selectable.decorator";
import { BoundingBoxSelection } from "../../selectable/impl/BoundingBoxSelection.model";
import { AnimationManager } from "./AnimationManager.model";

type CurrentAnimationData = {
    animationAction: AnimationAction,
    name: string,
    loopMode: AnimationActionLoopStyles
}

@SelectableGameObject(BoundingBoxSelection)
export class AnimatedCharacter extends Character {

    private animations = new Map<string, AnimationClip>();
    private mixer: AnimationMixer;
    private mapTexture: Texture;
    private animationTimerId;
    private restorePreviousAnimationTimerId;
    private currentAnimationAction: CurrentAnimationData;

    setClip(clipName: string, clip: AnimationClip) {
        this.animations.set(clipName, clip);
    }

    factoryMesh() {
        this._factoryAnimationMixer(this.characterObject as SkinnedMesh);
        this.characterObject.scale.set(21, 21, 21)
        this.characterObject.translateZ(-10);
        const targetMesh = getNestedMesh(this.characterObject);
        if (targetMesh) {
            targetMesh.renderOrder = ObjectsRenderingOrder.CharacterOrder;
            targetMesh.material = new MeshPhysicalMaterial({
                reflectivity: 9,
                sheen: new Color(1, 1, 1),
                color: 0xefefef,
                skinning: true,
                map: this.mapTexture ? this.mapTexture : null
            })
            targetMesh.castShadow = true;
        }
        return this.characterObject;
    }

    setAnimationManager(animationManager: AnimationManager) {
        animationManager.nextAnimation.subscribe(animName => {
            this.play(animName);
        })
    }

    setMapTexture(texture: Texture) {
        this.mapTexture = texture;
    }

    stopCurrentAnimation(nextAction: AnimationAction = null) {
        if (this.currentAnimationAction) {
            if (nextAction) {
                return this.currentAnimationAction.animationAction.crossFadeTo(nextAction, 1, false);
            } else {
                this.currentAnimationAction.animationAction.stop();
            }
        }
        return nextAction;
    }

    play(animaName: string, repeatTimes = Infinity) {
        return this.transtionTo(animaName, LoopRepeat, repeatTimes);
    }

    once(animName: string) {
        let currentAnim, loopMode, name;
        if (this.currentAnimationAction) {
            currentAnim = this.currentAnimationAction.animationAction;
            name = this.currentAnimationAction.name;
            loopMode = this.currentAnimationAction.loopMode;
        }
        const nextClip = this.animations.get(animName);
        if (this.restorePreviousAnimationTimerId) {
            clearTimeout(this.restorePreviousAnimationTimerId);
        }
        this.restorePreviousAnimationTimerId = setTimeout(() => {
            if (currentAnim) {
                this.transtionTo(name, loopMode)
            }
            clearTimeout(this.restorePreviousAnimationTimerId);
            this.restorePreviousAnimationTimerId = null;
        }, nextClip.duration * 1000);
        return this.transtionTo(animName, LoopOnce, 1);
    }

    private transtionTo(animaName: string, loopMode: AnimationActionLoopStyles, repeatTimes?: number) {
        if (!repeatTimes) {
            switch (loopMode) {
                case LoopOnce:
                    repeatTimes = 1;
                    break;
                case LoopRepeat:
                case LoopPingPong:
                    repeatTimes = Infinity;
                    break;
            }
        }

        const nextAnimation = this.stopCurrentAnimation(this.mixer.clipAction(this.animations.get(animaName)));
        nextAnimation.setLoop(loopMode, repeatTimes);
        this.currentAnimationAction = {
            animationAction: nextAnimation,
            name: animaName,
            loopMode
        };
        nextAnimation.reset();
        return nextAnimation.play();
    }

    private _factoryAnimationMixer(mesh: SkinnedMesh) {
        this.mixer = new AnimationMixer(mesh);
        this.animationTimerId = requestAnimationFrames((_, delta) => {
            this.mixer.update(delta / 2000);
        })
    }
}