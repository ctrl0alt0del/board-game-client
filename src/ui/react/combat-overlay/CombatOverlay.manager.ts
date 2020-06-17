import { Inject } from "injection-js"
import { StateWatcherService } from "../../../state/watchers/StateWatcher.service"
import { StateWatcher } from "../../../state/watchers/StateWatcher.model"
import { PhasesService } from "../../../game/phases/Phases.service"
import { CombatState } from "../../../state/GameState.interface"
import { PhaseUtils } from "../../../game/phases/Phases.utils"
import { PhaseType } from "../../../game/phases/PhaseType.enum"
import { CombatPhaseData } from "../../../game/phases/phase-impl/PhaseDataImpl.interface"
import { playUIAudio, wait } from "../../../utils/Common.utils"
import { BehaviorSubject, Subscription, Observable, pipe } from "rxjs"
import { GameStateRepository } from "../../../state/GameStateRepository.model"
import { getCombatBoundingBox } from "../../../game/enemy/combat/Combat.utils"
import { Vector3, Box3, BufferGeometry, Vector2 } from "three"
import { DicesService } from "../../../game/dice/Dice.service"
import { Combat } from "../../../game/enemy/combat/Combat.model"
import { CameraController } from "../../../camera/CameraController"
import { map } from "rxjs/operators"
import { Maybe } from "../../../utils/fp/Maybe"
import { EnemyService } from "../../../game/enemy/Enemy.service"
import { GameStateService } from "../../../state/GameState.service"
import { isTrue } from "../../../utils/Functions.utils"

export class CombatOverlayManager {

    onCombatStart: Observable<boolean>;
    onCombatDisplayIntro = new BehaviorSubject(false);

    get currentEnemy$() {
        return this.repository.currentCombat$.resolve(this.enemies).pipe(map(Maybe.map(combat => combat.enemy)));
    }

    constructor(
        @Inject(PhasesService) private phases: PhasesService,
        @Inject(GameStateRepository) private repository: GameStateRepository,
        @Inject(DicesService) private dices: DicesService,
        @Inject(EnemyService) private enemies: EnemyService
    ) {
        this.onCombatStart = repository.currentCombat$.map(pipe(map(isTrue))).resolve(enemies);
    }

    initializeSubscriptions() {
        const subscription = new Subscription();
        const phaseStartSub = this.phases.addOnPhaseStartHandler(PhaseUtils.pickStartPhase(PhaseType.Combat)((data: CombatPhaseData) => {
            playUIAudio('/sounds/fight_start.ogg');
            wait(1000).then(() => {
                this.onCombatDisplayIntro.next(true);
                playUIAudio('/sounds/fight_overlay.ogg');
            })
            return () => wait(7950).then(() => false);
        }));
        subscription.add(phaseStartSub);
        return subscription;
    }

    handleThrowDice() {
        const combat = this.repository.currentCombat;
        const bb = combat.maybeMap(getCombatBoundingBox);
        const center = new Vector3();
        bb.maybeMap(box => box.getCenter(center));
        center.set(center.x, center.y, 13);
        this.dices.animateDiceThrow(this.dices.generateDiceThrowResult(), center);
    }
}