import { PlayerActionHandler } from "./PlayerAction.model";
import { PlayerActionType, PlayerService } from "../Player.service";
import { Injector } from "injection-js";
import { InteractorsService } from "../../interactors/Interactors.service";
import { MapService } from "../../map/Map.service";
import { Tile } from "../../map/tiles/Tile";
import { TileIntercator } from "../../interactors/TileInteractor.model";
import { TileSector } from "../../map/tiles/TileSector.model";
import { MapSector } from "../../map/MapSector.model";
import { createSimplePhase } from "../../phases/SimpleGamePhase.model";
import { ScoutPhaseData } from "../../phases/phase-impl/PhaseDataImpl.interface";
import { PhaseType } from "../../phases/PhaseType.enum";
import { GameStateService } from "../../../state/GameState.service";
import { PhasesService } from "../../phases/Phases.service";

export class ScautActionHandler extends PlayerActionHandler {

    private interactorService: InteractorsService;
    private playerService: PlayerService;
    private mapService: MapService;

    private tmpSectorsCandidates: MapSector[] = [];

    get type() {
        return PlayerActionType.Scaut;
    }

    setInjector(injector: Injector) {
        super.setInjector(injector);
        this.interactorService = injector.get(InteractorsService);
        this.playerService = injector.get(PlayerService);
        this.mapService = injector.get(MapService);
        this.state = injector.get(GameStateService);
    }

    startAction() {
        const currentSector = this.playerService.player.sector;
        const currentMapSector = MapSector.fromSector(currentSector)
        const otherSectors = this.mapService.getSectorsNear(currentMapSector).filter(sector => {
            const sectorTile = sector.tile;
            return sectorTile !== currentSector.tile && !sectorTile.isFlipped;
        });
        this.tmpSectorsCandidates = otherSectors;
        this.mapService.addHighlightingForSectors(otherSectors);
        if (otherSectors.length > 0) {
            this.mapService.switchSectorSelection(true);
            for (const sector of otherSectors) {
                const tileInteractor = this.interactorService.getInteractorForGameObject<Tile>(sector.tile) as TileIntercator;
                tileInteractor.outlineHovered = true;
            }
            this.handleSubscriptions([
                this.mapService.sectorHoverObserver.subscribe(sector => {

                }),
                this.mapService.sectorClick.subscribe(sector => {
                    this.stopAction();
                    const scoutPhase = createSimplePhase<ScoutPhaseData>({
                        name: PhaseType.Scout,
                        player: this.playerService.player,
                        tile: sector.tile
                    }, async () => {
                        this.state.patchChanges([state => Object.assign({}, state, {
                            map: state.map.map(tile => tile.tileName === sector.tile.name ? Object.assign({}, tile, {isFlipped: true}): tile)
                        })])
                    });
                    this.phases.initiatePhaseStart(scoutPhase);
                })
            ])
        }
    }
    stopAction(){
        super.stopAction();
        this.mapService.switchSectorSelection(false);
        for (const sector of this.tmpSectorsCandidates) {
            const tileInteractor = this.interactorService.getInteractorForGameObject<Tile>(sector.tile) as TileIntercator;
            tileInteractor.outlineHovered = false;
        }
        this.mapService.removeHighlightingForSectors(this.tmpSectorsCandidates);
        this.tmpSectorsCandidates = [];
    }
}