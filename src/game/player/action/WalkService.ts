import { Injector } from "injection-js";
import { MapService } from "../../map/Map.service";
import { Subscription } from "rxjs";
import { PlayerActionHandler } from "./PlayerAction.model";
import { PlayerActionType, PlayerService } from "../Player.service";
import { SelectionService } from "../../game-object/Selection.service";
import { PhasesService } from "../../phases/Phases.service";
import { MapSector } from "../../map/MapSector.model";
import { GameStateService } from "../../../state/GameState.service";
import { SimpleGamePhase } from "../../phases/SimpleGamePhase.model";
import { WalkPhaseData } from "../../phases/phase-impl/PhaseDataImpl.interface";
import { PhaseType } from "../../phases/PhaseType.enum";

export class WalkActionHandler extends PlayerActionHandler {

    private map: MapService;
    private selections: SelectionService;
    private playerService: PlayerService;

    private currentHighlightedSectors: MapSector[] = [];

    get type() {
        return PlayerActionType.Walk;
    }

    setInjector(injector: Injector) {
        super.setInjector(injector);
        this.map = injector.get(MapService);
        this.playerService = injector.get(PlayerService);
        this.selections = injector.get(SelectionService);
        this.phases = injector.get(PhasesService);
        this.state = injector.get(GameStateService);
    }

    startAction() {
        const player = this.playerService.player;
        const currentSector = player.sector;
        const currentMapSector = MapSector.fromSector(currentSector);
        const nextSectors = this.map.getSectorsNear(currentMapSector);
        this.map.switchSectorSelection(true);
        this.selections.unmakeSelectable(this.playerService.playerCharacter);
        this.currentHighlightedSectors = nextSectors;
        this.map.addHighlightingForSectors(nextSectors);
        this.handleSubscriptions([
            this.map.sectorHoverObserver.subscribe(sector => {
                if (sector && sector.isExplored) {
                    this.map.requestMapGuider(currentMapSector, sector, this);
                } else {
                    this.map.freeMapGuider(this);
                }
            }),
            this.map.sectorClick.subscribe(mapSector => {
                if(nextSectors.some(s => s.equalTo(mapSector)) && mapSector.isExplored) {
                    this.stopAction();
                    const walkPhase = new SimpleGamePhase<WalkPhaseData>();
                    walkPhase.data = {
                        player: this.playerService.player,
                        startSector: currentSector,
                        destinationSector: mapSector.tileSector,
                        name: PhaseType.Walk
                    }
                    walkPhase.startPhaseAction = async () => {
                        this.state.patchChanges([state => Object.assign({}, state, {
                            currentPlayer: Object.assign({}, state.currentPlayer, {
                                sector: mapSector.tileSector.toGameState()
                            })
                        })]);
                    }
                    this.phases.initiatePhaseStart(walkPhase)
                }
            })
        ])
    }

    stopAction() {
        super.stopAction();
        this.map.switchSectorSelection(false);
        this.selections.makeSelectable(this.playerService.playerCharacter);
        this.map.freeMapGuider(this);
        this.map.removeHighlightingForSectors(this.currentHighlightedSectors);
        this.currentHighlightedSectors = [];
    }
}