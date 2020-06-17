import { Injectable, Inject } from "injection-js";
import { DiceThrowResult, DiceSideType } from "./DieResult.interface";
import { PhasesService } from "../phases/Phases.service";
import { DiceObject } from "./DiceGameObject.model";
import { AssetsDefineObject, AssetsEntryType } from "../../game-utils/assets/AssetsService.interface";
import { AssetsService } from "../../game-utils/assets/Assets.service";
import { range } from "rxjs";
import { rangeArray } from "../../utils/Common.utils";
import { Mesh, Vector3, Texture, MeshPhongMaterial, MeshPhysicalMaterial } from "three";
import { AnimationService } from '../game-object/animation/Animation.service';
import { AnimationTimeline } from "../game-object/animation/AnimationTilemeline.model";
import { GameObjectManager } from '../game-object/GameObjectsManager.service';
import { MathUtils } from "../../utils/Math.utils";
import { CameraController } from "../../camera/CameraController";
import { DiceCheck, DiceRoundsUpdator } from "./DiceCheck.model";
import { DieSide, getDiceSide } from "./DiceSide.model";
import { createSimplePhase } from "../phases/SimpleGamePhase.model";
import { ThrowDicePhase } from "../phases/phase-impl/PhaseDataImpl.interface";
import { PhaseType } from "../phases/PhaseType.enum";
import { GameStateService } from "../../state/GameState.service";
import { StateLensFactory } from "../../utils/lens/StateLens.factory";
import { rerollsCount } from "../../game-logic/CalcualtionBreakdown.utils";

@Injectable()
export class DicesService {

    private availableDice: DiceObject[] = [];

    constructor(
        @Inject(PhasesService) private phases: PhasesService,
        @Inject(AssetsService) private assets: AssetsService,
        @Inject(AnimationService) private animation: AnimationService,
        @Inject(GameObjectManager) private objects: GameObjectManager,
        @Inject(CameraController) private cameraCtrl: CameraController
    ) {

    }

    get assetsDependency(): AssetsDefineObject {
        return {
            dice_mesh: {
                type: AssetsEntryType.Mesh,
                config: {
                    loadUrl: '/obj/dice.glb'
                }
            },
            dice_texture: {
                type: AssetsEntryType.Texture,
                config: {
                    loadUrl: '/text/dice.jpg'
                }
            }
        }
    }

    throwDice(diceCheckObj: DiceCheck, count: number, checkUpdateFn: DiceRoundsUpdator) {
        const result = this.generateDiceThrowResult(count);
        const phase = createSimplePhase<ThrowDicePhase>({
           name: PhaseType.DiceThrow,
           diceThrowResult: result 
        }, async injector => injector.get(GameStateService).patchChanges([StateLensFactory.currentDiceCheckRounds.add(result)]))
        this.phases.initiatePhaseStart(phase);
        checkUpdateFn(diceCheckObj, result);
        return result;
    }

    animateDiceThrow(result: DieSide[], landPosition: Vector3) {
        const angleStep = Math.PI * 2 / this.availableDice.length;
        const animDuration = 3.1;
        for(let i = 0; i < result.length; i++) {
            const die = this.availableDice[i];
            const randomVal = Math.random();
            const theta = angleStep*i;
            const shiftedLandVector = landPosition.clone().add(new Vector3(80 * Math.sin(theta), 80 * Math.cos(theta), 0));
            const camPos = this.cameraCtrl.camera.position.clone();
            const throwStartPos = camPos.lerp(shiftedLandVector, .4).add(new Vector3(50 + randomVal * 150, 50 + randomVal * 150, 0));
            const animFn = die.getAnimation(result[i], throwStartPos, shiftedLandVector, animDuration);
            const timeline = new AnimationTimeline(animDuration * 1000);
            timeline.setAnimation(animFn);
            this.animation.execute(timeline)
        }
    }

    create(count: number) {
        return Promise.all(rangeArray(count - 1).map(async () => {
            const { geometry } = await this.assets.get('dice_mesh');
            const texture = await this.assets.get<Texture>('dice_texture');
            texture.flipY = false;
            const diceMaterial = new MeshPhysicalMaterial({
                map: texture,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                metalness: 0.2,
                roughness: 0.5,
                color: 0x00ff00
            })
            const diceObject = new DiceObject(new Mesh(geometry, diceMaterial));
            this.availableDice.push(diceObject);
            this.objects.addObject(diceObject);
            return diceObject;
        }))
    }

    generateDiceThrowResult(diceCount = 3): DiceThrowResult {
        return new Array(diceCount).fill(0).map(value => getDiceSide(Math.floor(Math.random() * 6)));
    }
}