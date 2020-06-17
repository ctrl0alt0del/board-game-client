import { IdComparable } from "../../../utils/IdComparable.interface";
import { TileSector } from "./TileSector.model";
import { v4 } from "uuid";
import { Tile } from "./Tile";

export type EdgePartId = number;

export class TileEdgeNode {
    constructor(readonly edgeNumber: number, readonly edgePartId: EdgePartId) {

    }
}

export const createTileEdgeNodes = () => {
    const edgesNodes: TileNode[] = [];
    for (let i = 0; i < 6; i++) {
        edgesNodes.push(new TileNode(new TileEdgeNode(i, 0)), new TileNode(new TileEdgeNode(i, 1)));
    }
    return edgesNodes;
}

export class TileNode implements IdComparable {
    private static nodes: TileNode[] = [];
    readonly comparableId = v4();
    readonly sector?: TileSector;
    readonly edgeNode?: TileEdgeNode;
    tile: Tile;
    constructor(item?: TileSector | TileEdgeNode) {
        if (item instanceof TileSector) {
            this.sector = item;
        } else {
            this.edgeNode = item;
        }

        TileNode.nodes.push(this);
    }

    static getBySector(sector: TileSector) {
        return this.nodes.find(node => node.sector && node.sector === sector);
    }

    static getEdgeNode(tile: Tile, edgeNumber: number, edgePartId: number) {
        return this.nodes.find(node => node.edgeNode && node.tile === tile && node.edgeNode.edgeNumber === edgeNumber && node.edgeNode.edgePartId === edgePartId);
    }
}