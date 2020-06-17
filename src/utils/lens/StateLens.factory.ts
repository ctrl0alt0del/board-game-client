import { Lens, LensUtils } from "./StateLens.utils";
import { GameState, PlayerState, InventoryItemState } from "../../state/GameState.interface";
import { Reader } from "../fp/Reader";
import { EffectResolverService } from "../../game-logic/effects/EffectResolver.service";
import { contramapFunction } from "../Functions.utils";
import { isWeapon } from "../../game/active/Weapon.model";

export class StateLensFactory {

    static getPlayerInventory(playerId: string) {
        return this.inventory.filter(item => item.owner === playerId)
    }

    static addToPlayerInventory() {
        return LensUtils.compose(
            this.inventory,
            LensUtils.push()
        )
    }

    static getEquipedItems = (playerId: string) => StateLensFactory.getPlayerInventory(playerId).filter(item => item.isEquiped);


    static player = LensUtils.key<GameState, 'currentPlayer'>('currentPlayer');

    static playerEquipedItems = LensUtils.toReadOnlyArrayLens(
        LensUtils.aggregate(
            StateLensFactory.player,
            contramapFunction(player => player.id, StateLensFactory.getEquipedItems)
        )
    );

    static playerStats = LensUtils.compose(StateLensFactory.player, LensUtils.key('statistics'))

    static inventory = LensUtils.toArrayLens(LensUtils.key<GameState, 'inventory'>('inventory'));


    static playerSector = LensUtils.compose(StateLensFactory.player, LensUtils.key<PlayerState, 'sector'>('sector'));

    static entities = LensUtils.toArrayLens(LensUtils.key<GameState, 'entities'>('entities'));

    static currentPlayerCaps = LensUtils.compose(StateLensFactory.player, LensUtils.key<PlayerState, 'capsAmount'>('capsAmount'));

    static currentCombat = LensUtils.key<GameState, 'currentCombat'>('currentCombat');

    static gameSideEffectsOutcomes = LensUtils.key<GameState, 'sideEffectsResult'>('sideEffectsResult');

    static entityActiveEffects(entityId: string) {
        const entityLens = LensUtils.compose(
            this.entities,
            LensUtils.find(entity => entity.entityId === entityId)
        );
        return new Reader((effects: EffectResolverService) => LensUtils.toArrayLens(
            LensUtils.compose(
                entityLens,
                LensUtils.key('activeEffects')
            )
        ).map(effect => effects.fromGameState(effect), effect => ({ effectId: effect.id })));
    }

    static giveCapsToCurrentPlayer(value: number) {
        return LensUtils.add<GameState>(value)(StateLensFactory.currentPlayerCaps);
    }

    static currentDiceCheck = LensUtils.key<GameState, 'currentDiceCheck'>('currentDiceCheck')

    static currentDiceCheckRounds = LensUtils.toArrayLens(LensUtils.compose(StateLensFactory.currentDiceCheck, LensUtils.key('rounds')))
}