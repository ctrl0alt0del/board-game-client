import { GameObjectInteractor } from "./GameObjectInteractor.model";
import { Vector3, Color } from "three";
import { MapService } from "../map/Map.service";
import { Tile, TileType } from "../map/tiles/Tile";
import { RenderingPipelineService } from "../../render/RenderingPipeline.service";
import { MapSector } from "../map/MapSector.model";

export class TileIntercator extends GameObjectInteractor<Tile> {

    outlineHovered: boolean = false;

    hover(point: Vector3) {
        const map = this.injector.get(MapService);
        const sector = map.getSectorByTilePoint(this.gameObject, point);
        if (sector) {
            map.sectorHover.next(MapSector.fromSector(sector));
            if(this.outlineHovered) {
                const pipeline = this.injector.get(RenderingPipelineService);
                const outlineColor = this.gameObject.type === TileType.Dangerous ? 0xff0000 : 0x00ff00;
                pipeline.addOutlineObjects([this.gameObject.object3d], { hiddenEdgeColor: new Color(outlineColor), visibleEdgeColor: new Color(outlineColor)});
            }
        }
    }
    unhover() {
        const map = this.injector.get(MapService);
        map.sectorHover.next(null);
        const pipeline = this.injector.get(RenderingPipelineService);
        pipeline.removeOutlineObjects([this.gameObject.object3d]);
    }
    touch(point: Vector3) {
        const map = this.injector.get(MapService);
        const sector = map.getSectorByTilePoint(this.gameObject, point);
        if (sector) {
            map.sectorClick.next(MapSector.fromSector(sector));
        }
    }
}