import { AnimatedCharacter } from "../game-object/characters/animated-characters/AnimatedCharacter.model";
import { Mesh, Object3D, Vector3, Box3 } from "three";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";
import { MathUtils } from "../../utils/Math.utils";
import { TileSector } from "../map/tiles/TileSector.model";
import { Subscription } from "rxjs";
import { EnemyState } from "../../state/GameState.interface";
import { PhaseSubscription } from "../phases/Phases.service";
import { EnemyConfig } from "./EnemyConfig.interface";
import { GameEntity } from "../../game-logic/GameEntity.model";

export enum EnemyType {
    INSECTS = 'INSECTS',
    RAIDER = 'RAIDER'
}

export class Enemy extends AnimatedCharacter {

    private _attachedPosition: Vector3;

    tokenMesh: Mesh;

    characterObject = new Object3D();

    currentSector: TileSector | null = null;

    phaseSubscribers: PhaseSubscription[] = [];

    isActive = false;

    entity: GameEntity;

    get boundingBox() {
        if (this.characterObject) {
            return new Box3().setFromObject(this.characterObject)
        } else {
            return new Box3().setFromObject(this.tokenMesh);
        }
    }

    get attachedPosition() {
        return this._attachedPosition;
    }

    set attachedPosition(value: Vector3) {
        this._attachedPosition = value;
        this.tokenMesh.position.set(value.x, value.y, value.z);
    }

    constructor(public config: EnemyConfig) {
        super();
        this.onAddedToScene.subscribe(() => {
            const { x, y } = this.attachedPosition;
            const elevation = 1000;
            this.tokenMesh.position.set(x, y, elevation);
            const gravity = 980;
            const timeToFall = Math.sqrt(2 * elevation / gravity) * 1000;
            this.tokenMesh.rotation.set(MathUtils.toRad(90), 0, 0);
            this.pushAnimation((passedMs) => {
                if (passedMs >= timeToFall) {
                    this.tokenMesh.rotation.set(0, 0, 0)
                    this.tokenMesh.position.set(this.tokenMesh.position.x, this.tokenMesh.position.y, 12)
                } else {
                    const passedSecs = passedMs / 1000;
                    const interpolatedPosition = new Vector3(x, y, elevation).add(new Vector3(0, 0, -gravity).multiplyScalar(passedSecs * passedSecs / 2));
                    this.tokenMesh.position.set(interpolatedPosition.x, interpolatedPosition.y, interpolatedPosition.z);
                    if (passedMs / timeToFall > .95) {
                        const rot = 90 - 90 * ((passedMs / timeToFall) - 0.95) / .05;
                        this.tokenMesh.rotation.set(MathUtils.toRad(rot), 0, 0)
                    }
                }
            }, timeToFall);
        })
    }

    factoryMesh() {
        if (this.tokenMesh) {
            this.tokenMesh.scale.set(60, 60, 60);
            this.tokenMesh.translateZ(5)
        }
        return this.tokenMesh;
    }

    toGameState(): EnemyState {
        if(!this.currentSector) {
            throw new Error("Unable to cast Enemy to EnemyState: Enemy is not online.");
        }
        return {
            enemyKey: this.config.key,
            isActive: this.isActive,
            sector: this.currentSector.toGameState()
        }
    }
}