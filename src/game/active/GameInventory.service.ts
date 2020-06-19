import { Injectable, Inject } from "injection-js";
import { GameActiveParser } from "./parsers/ActiveParser.service";
import { factoryWeaponFromGameData, isWeapon } from "./Weapon.model";
import { GameActive, ActiveType } from "./GameActive.model";
import { Maybe } from "../../utils/fp/Maybe";
import { InventoryItemState } from "../../state/GameState.interface";
import { GameInventoryItem } from "./GameInventoryItem.model";
import { GameEntity } from "../../game-logic/GameEntity.model";
import { createSimplePhase } from "../phases/SimpleGamePhase.model";
import { DrawActivePhase } from "../phases/phase-impl/PhaseDataImpl.interface";
import { GameStateService } from "../../state/GameState.service";
import { StateLensFactory } from "../../utils/lens/StateLens.factory";
import { PlayerService } from "../player/Player.service";
import { Reader } from "../../utils/fp/Reader";
import { PhaseType } from "../phases/PhaseType.enum";
import { PhasesService } from "../phases/Phases.service";

@Injectable()
export class GameInventoryService {

    private actives: GameActive[] = [];

    private onlineActives: GameActive[] = [];

    IsItemWeapon = this.isItemWeapon.bind(this);

    constructor(
        @Inject(GameActiveParser) private activesParser: GameActiveParser,
        @Inject(PlayerService) private playerService: PlayerService,
        @Inject(PhasesService) private phases: PhasesService
    ) {

    }

    async initializeItems() {
        this.activesParser.parsers.set('WEAPON', factoryWeaponFromGameData)
        this.actives = await this.activesParser.parse('/models/items/items.txt');
        return this.actives.map(active => {
            const entity = new GameEntity(active.id, active.effects);
            active.entity = entity;
            return entity;
        })
    }

    drawUniqueActive(name: string) {
        const predicate = (active: GameActive): boolean => active.name === name && active.type === ActiveType.UniqueAsset;
        return this.drawActive(predicate);
    }

    drawRandom(type: ActiveType) {
        return this.drawActive(active => active.type === type);
    }

    getActive(id: string) {
        return Maybe.from(this.actives.find(active => active.id === id))
    }

    private drawActive(predicate: (active: GameActive) => boolean) {
        return new Reader((playerId: string) => {
            const activeLibrary = this.getActiveLibrary();
            return Maybe.from(activeLibrary.find(predicate)).map(active => {
                const phase = this.createDrawActivePhase(active, playerId);
                this.phases.initiatePhaseStart(phase);
                return active;
            });
        }).toMaybeReader();
    }

    private createDrawActivePhase(active: GameActive, playerId: string) {
        return createSimplePhase<DrawActivePhase>({
            name: PhaseType.DrawActive,
            active: active
        }, async (injector) => {
            const state = injector.get(GameStateService);
            state.patchChanges([
                StateLensFactory.entities.add(active.entity.toGameState()),
                StateLensFactory.getPlayerInventory(playerId).add(active.toGameState(playerId, true))
            ]);
        });
    }

    private getActiveLibrary() {
        return this.actives.filter(active => !this.onlineActives.some(another => another === active));
    }

    fromGameState(item: InventoryItemState) {
        return this.getActive(item.activeId).map(active => new GameInventoryItem(active, this.playerService.player, item.isEquiped))
    }

    isItemWeapon(item: InventoryItemState) {
        return this.fromGameState(item).map(item => isWeapon(item.active))
    }


}