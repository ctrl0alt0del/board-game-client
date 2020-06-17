import { Injectable, Inject } from "injection-js";
import { Weapon, isWeapon } from "../../../game/active/Weapon.model";
import { Observable } from "rxjs";
import { GameStateService } from "../../../state/GameState.service";
import { StateLensFactory } from "../../../utils/lens/StateLens.factory";
import { Maybe } from "../../../utils/fp/Maybe";
import { map } from "rxjs/operators";
import { GameInventoryService } from "../../../game/active/GameInventory.service";
import { InventoryItemState } from "../../../state/GameState.interface";
import { GameInventoryItem } from "../../../game/active/GameInventoryItem.model";
import { PlayerService } from "../../../game/player/Player.service";
import { PrimaryStatistics } from "../../../game-logic/data/Constants.utils";
import { compose } from "../../../utils/Functions.utils";

const toGameInventoryArray = (service: GameInventoryService) => (inventoryState: InventoryItemState[]) => Maybe.flat(inventoryState.map(item => service.fromGameState(item)));

const toGameActive = (invetory: GameInventoryItem) => invetory.active

@Injectable()
export class StatsMenuManager {

    readonly equipedWeapon: Observable<Maybe<Weapon>>;
    readonly playerStats: Observable<PrimaryStatistics[]>;

    constructor(
        @Inject(GameStateService) state: GameStateService,
        @Inject(GameInventoryService) inventoryService: GameInventoryService,
        @Inject(PlayerService) playerService: PlayerService
    ) {
        this.equipedWeapon = state.onStateUpdate.pipe(
            map(state => StateLensFactory.getEquipedItems(playerService.player.id).get(state)),
            map(equipedItems => equipedItems.map(toGameInventoryArray(inventoryService)).asArray()),
            map(items => Maybe.findInArray(items.map(toGameActive), active => isWeapon(active)) as Maybe<Weapon>)
        );
        this.playerStats = state.map(compose(StateLensFactory.playerStats.get, Maybe.orDefault([])))
    }
}