import { Tile } from "./tiles/Tile";
import { TileSector } from "./tiles/TileSector.model";
import { TileMaterial } from "../../shaders/materials/TileMaterial.factory";
import { Color, Vector2 } from "three";

export class MapSector {
    unexploredTile?: Tile;
    tileSector?: TileSector;

    get tile() {
        return this.unexploredTile ? this.unexploredTile : this.tileSector.tile;
    }

    get sectors(): TileSector[] {
        return this.unexploredTile ? this.unexploredTile.sectors : [this.tileSector];
    }

    get highlightColors(): Color[] {
        if (this.unexploredTile) {
            return this.unexploredTile.sectors.map(sector => sector.colorCode);
        } else {
            return [this.tileSector.colorCode];
        }
    }

    get center() {
        return this.unexploredTile ? new Vector2(0, 0) : this.tileSector.center;
    }

    get isExplored() {
        return !this.unexploredTile;
    }

    static fromSector(sector: TileSector) {
        const output = new MapSector();
        if (sector.tile.isFlipped) {
            output.tileSector = sector;
        } else {
            output.unexploredTile = sector.tile;
        }
        return output;
    }
    
    is(sector: TileSector) {
        if(this.tileSector) {
            return this.tileSector === sector;
        } else {
            return this.unexploredTile.sectors.some(s2 => s2 === sector);
        }
    }

    equalTo(mapSector: MapSector) {
        const tileSectorCompare = this.tileSector && mapSector.tileSector && this.tileSector === mapSector.tileSector;
        const tileCompare = this.unexploredTile && mapSector.unexploredTile && this.unexploredTile === mapSector.unexploredTile;
        return tileCompare || tileSectorCompare;
    }
    
}