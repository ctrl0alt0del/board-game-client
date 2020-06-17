import { Injectable, Inject } from "injection-js";
import { TilePosition } from "./TilePosition.model";
import { Tile } from "./tiles/Tile";
import { TilePositionManager } from "./TilePositionManager/TilePositionManager.interface";
import { GameObjectManager } from "../game-object/GameObjectsManager.service";
import { Vector3, Matrix4, Matrix3, Vector2, Shader, ShaderMaterial, Color, Geometry, Mesh, BufferGeometry, MeshBasicMaterial, Group, CylinderGeometry, SphereGeometry, CircleGeometry } from "three";
import { TileSector } from "./tiles/TileSector.model";
import { TILE_SIZE } from "../../common/InjectionTokens.utils";
import { MathUtils } from "../../utils/Math.utils";
import { TileIntercator } from "../interactors/TileInteractor.model";
import { InteractorsService } from "../interactors/Interactors.service";
import { getInteractorKeyForTile } from "./Map.utils";
import { Subject, BehaviorSubject } from "rxjs";
import { getColorHash } from "../../utils/Color.utils";
import { getImageData } from "../../utils/Image.utils";
import { TileNode } from "./tiles/TileNode.model";
import { TileMaterial } from "../../shaders/materials/TileMaterial.factory";
import { SelectionService } from "../game-object/Selection.service";
import { MeshFactory } from "../../meshes/MeshFactory";
import { SceneComposer } from "../../scene/SceneComposer";
import { CameraController } from "../../camera/CameraController";
import { distinctUntilChanged } from 'rxjs/operators';
import { Graph, GraphEdge } from "../../utils/Graph.model";
import { MapGuider } from "../helpers/MapGuide.model";
import { requestAnimationFrames, cancelRequestAnimationFrames } from "../../utils/Common.utils";
import { MapSector } from "./MapSector.model";
import { SectorRef } from "../../state/GameState.interface";


const connectedSubEdge = (graph1: Graph<TileNode>, graph2: Graph<TileNode>, tileEdgeNode1: TileNode, tileEdgeNode2: TileNode, outGraph: Graph<TileNode>) => {
    const thisEdgeNode0ConnectedSectors = graph1.getEndNodes(tileEdgeNode1);
    const t00EdgeNode0ConnectedSectors = graph2.getEndNodes(tileEdgeNode2);
    for (const thisSectorNode of thisEdgeNode0ConnectedSectors) {
        for (const t00SectorNode of t00EdgeNode0ConnectedSectors) {
            outGraph.addEdge(new GraphEdge(thisSectorNode, t00SectorNode));
        }
    }
}


const connectTiles = (tile1: Tile, tile2: Tile, tile1EdgeNumber: number, tile2EdgeNumber: number, resultGraph: Graph<TileNode>) => {
    const graph1 = tile1.graph;
    const graph2 = tile2.graph;
    const thisEdgeNode0 = TileNode.getEdgeNode(tile1, tile1EdgeNumber, 0);
    const thisEdgeNode1 = TileNode.getEdgeNode(tile1, tile1EdgeNumber, 1);
    const t00edgeNode0 = TileNode.getEdgeNode(tile2, tile2EdgeNumber, 0);
    const t00edgeNode1 = TileNode.getEdgeNode(tile2, tile2EdgeNumber, 1);
    connectedSubEdge(graph1, graph2, thisEdgeNode0, t00edgeNode1, resultGraph);
    if (!thisEdgeNode1 || !t00edgeNode0) {
        debugger;
    }
    connectedSubEdge(graph1, graph2, thisEdgeNode1, t00edgeNode0, resultGraph);
}

export type MinimapData = {
    src: string,
    width: number,
    height: number
}

@Injectable()
export class MapService {
    private tiles: Tile[] = [];
    private mapGraph: Graph<TileNode>;

    sectorClick = new Subject<MapSector>();
    sectorHover = new Subject<MapSector>();
    minimapUpdate = new BehaviorSubject<MinimapData>(null);

    private totalHeight = 0;
    private totalWidth = 0;

    private currentHighlightedSectors: MapSector[] = [];

    get sectorHoverObserver() {
        return this.sectorHover.pipe(distinctUntilChanged());
    }

    private guider = new MapGuider();

    private guiderRefBy: Object[] = [];

    transformationMatrix = new Matrix3().rotate(MathUtils.toRad(-60)).scale(-this.tileWidth * 2, this.tileWidth * 2);

    constructor(
        @Inject(TilePositionManager) private tilePosMngr: TilePositionManager,
        @Inject(GameObjectManager) private objectsMngr: GameObjectManager,
        @Inject(SelectionService) private selection: SelectionService,
        @Inject(TILE_SIZE) private tileWidth: number,
        @Inject(InteractorsService) private interactors: InteractorsService,
        @Inject(SceneComposer) sceneComposer: SceneComposer,
        @Inject(TILE_SIZE) private tileSize: number
    ) {
        sceneComposer.scene.add(this.guider);
    }


    putTile(pos: TilePosition, tile: Tile) {
        tile.setInitialMatrix(this.createMatrixForPosition(pos));
        tile.position = pos;
        this.tiles.push(tile);
        const interactor = new TileIntercator(tile);
        this.interactors.register(getInteractorKeyForTile(tile), interactor);
        this.objectsMngr.addObject(tile);
        if (pos.i + 1 > this.totalWidth) {
            this.totalWidth = pos.i + 1;
        }
        if (pos.j + 1 > this.totalHeight) {
            this.totalHeight = pos.j + 1;
        }
    }

    compileMapGraph() {
        const resultGraph = new Graph<TileNode>();
        this.tiles.forEach(tile => {
            const { i, j } = tile.position;
            const thisGraph = tile.graph;
            for (const edge of thisGraph.edges()) {
                if (edge.start.sector && edge.end.sector) {
                    resultGraph.addEdge(edge);
                }
            }
            const t00 = this.tiles.find(tile => tile.position.i === i && tile.position.j === j - 1);
            if (t00) {
                connectTiles(tile, t00, 0, 3, resultGraph);
            }
            const t01 = this.tiles.find(tile => tile.position.i === i + 1 && tile.position.j === j - 1);
            if (t01) {
                connectTiles(tile, t01, 1, 4, resultGraph);
            }
            const t10 = this.tiles.find(tile => tile.position.i === i - 1 && tile.position.j === j);
            if (t10) {
                connectTiles(tile, t10, 5, 2, resultGraph);
            }
            const t12 = this.tiles.find(tile => tile.position.i === i + 1 && tile.position.j === j);
            if (t12) {
                connectTiles(tile, t12, 2, 5, resultGraph);
            }
            const t20 = this.tiles.find(tile => tile.position.i === i - 1 && tile.position.j === j + 1);
            if (t20) {
                connectTiles(tile, t20, 4, 1, resultGraph);
            }
            const t21 = this.tiles.find(tile => tile.position.i === i && tile.position.j === j + 1);
            if (t21) {
                connectTiles(tile, t21, 3, 0, resultGraph);
            }
        });
        this.mapGraph = resultGraph;
        const minimapURL = this.createMinimapImage(620, 400);
        this.minimapUpdate.next({
            src: minimapURL,
            width: 620,
            height: 400
        })

    }

    getInitialSector(): TileSector {
        const initialTile = this.tiles[0];
        return initialTile.sectors[0];
    }

    getWorldCenterCoords(sector: MapSector) {
        const { center, tile } = sector;
        const tilePos = tile.object3d.position;
        const rotatedCenter = new Vector2(center.x, center.y).applyMatrix3(this.transformationMatrix);

        return new Vector3(rotatedCenter.x, rotatedCenter.y, 0).add(tilePos);
    }

    private createMatrixForPosition(pos: TilePosition) {
        const cartesian = this.tilePosMngr.getCartesian(pos);
        const translateComponent = new Vector3(cartesian.x, cartesian.y, 0);
        return new Matrix4().setPosition(translateComponent);
    }

    getSectorByTilePoint(tile: Tile, point: Vector3) {
        const sectorMap = tile.sectorMapTexture;
        point = new Vector3().subVectors(point, tile.object3d.position);
        const { data, width, height } = getImageData(sectorMap.image);
        const matrix = new Matrix3().getInverse(this.transformationMatrix);
        const point2 = new Vector2(point.x, point.y).applyMatrix3(matrix);

        const { x, y } = point2;
        const textureY = y * width + height / 2;
        const textureX = x * width + width / 2;
        const imageIndex = (Math.floor(textureY) * Math.floor(width) + Math.floor(textureX)) * 4;
        const presentedColorHash = `${data[imageIndex]}_${data[imageIndex + 1]}_${data[imageIndex + 2]}`;
        return tile.sectors.find(sector => {
            return getColorHash(sector.colorCode) === presentedColorHash
        })
    }

    getSectorsNear(currentSector: MapSector) {
        const graph = this.mapGraph;
        return currentSector.sectors.reduce<MapSector[]>((total, sector) => {
            const sectorNode = TileNode.getBySector(sector);
            const adjacentSectors = graph.getEndNodes(sectorNode).filter(node => !!node.sector).map(node => MapSector.fromSector(node.sector));
            return total.concat(adjacentSectors.filter(newSector => {
                return !total.some(oldSector => oldSector.equalTo(newSector));
            }))
        }, [currentSector]);
    }

    switchSectorSelection(value: boolean) {
        for (const tile of this.tiles) {
            if (value) {
                this.selection.makeSelectable(tile);
            } else {
                this.selection.unmakeSelectable(tile);
            }
        }
    }

    checkIfSectorsAdjacenct(s1: MapSector, s2: MapSector) {
        if (s1.equalTo(s2)) {
            return false;
        }
        return this.getSectorsNear(s1).some(sector => sector.equalTo(s2));
    }

    requestMapGuider(fromSector: MapSector, toSector: MapSector, refBy: any) {
        if (!this.checkIfSectorsAdjacenct(fromSector, toSector)) {
            return;
        }
        const sector1Pos = this.getWorldCenterCoords(fromSector), sector2Pos = this.getWorldCenterCoords(toSector);
        this.guider.visible = true;
        this.guider.updatePositions(sector1Pos, sector2Pos);
        this.guiderRefBy.push(refBy)
    }

    freeMapGuider(refBy: any) {
        this.guiderRefBy = this.guiderRefBy.filter(obj => obj !== refBy);
        if (this.guiderRefBy.length === 0) {
            this.guider.visible = false;
        }
    }

    addHighlightingForSectors(mapSectors: MapSector[]) {
        this.currentHighlightedSectors.push(...mapSectors);
        this.tiles.forEach(tile => {
            tile.enableHighlight();
            const tileSectors = mapSectors.filter(sector => sector.tile === tile);
            if (tileSectors.length > 0) {
                tile.highlightSectors(mapSectors);
            }
        });
    }
    removeHighlightingForSectors(sectors: MapSector[]) {
        this.currentHighlightedSectors = this.currentHighlightedSectors.filter(sector => !sectors.some(sector2 => sector2.equalTo(sector)));
        if (this.currentHighlightedSectors.length === 0) {
            this.tiles.forEach(tile => tile.disableHighlight());
        }
    }

    flipTile(tile: Tile) {
        const totalTime = 1400;
        tile.isFlipped = true;
        let flipTileAnimId = requestAnimationFrames(val => {
            if (val > totalTime) {
                cancelRequestAnimationFrames(flipTileAnimId);
                tile.isFlipped = true;
            } else {
                tile.setFOWThreshold(val / totalTime);
            }
        });
    }

    createMinimapImage(width: number, height: number) {
        const canvas = Object.assign(document.createElement('canvas'), { width, height });
        const ctx = canvas.getContext('2d');
        const heightToWidthCoef = 2 / Math.sqrt(3);
        const tileSize = this.totalWidth > this.totalHeight ? width / (this.totalWidth + 1) : (height / (this.totalHeight + 1) * heightToWidthCoef);
        for (const tile of this.tiles) {
            const { i: j, j: i } = tile.position;
            let { x, y } = this.tilePosMngr.getCartesian({ i, j }, tileSize);
            y /= 2;
            x /= 2;
            const shiftX = tileSize / 2, shiftY = tileSize / 2;
            ctx.translate(shiftX, shiftY)
            ctx.rotate(MathUtils.toRad(-30));
            ctx.translate(-shiftX, -shiftY);
            const texture = tile.isFlipped ? tile.tileFaceTexture : tile.tileBackTexture;
            ctx.drawImage(texture.image, x, y, tileSize, tileSize);
            ctx.translate(shiftX, shiftY);
            ctx.rotate(MathUtils.toRad(30));
            ctx.translate(-shiftX, -shiftY);

        }
        return canvas.toDataURL();
    }
    /**
     * scale vector3 to vector2 ([-1;1],[-1;1])
     * 
    */
    getReletiveToMap(point: Vector3) {
        let { x, y } = point;
        const tileHeight = this.tileSize * Math.sqrt(3) / 2;
        const width = this.totalWidth > this.totalHeight ? this.totalWidth + 1 : this.totalWidth;
        const height = this.totalWidth > this.totalHeight ? this.totalHeight : this.totalHeight + 1;
        const newY = (x + tileHeight) / (height * tileHeight * 2);
        const newX = (y + this.tileSize) / (width * this.tileSize * 2);
        return new Vector2(newX, newY);
    }

    getSectorBySectorState(sectorState: SectorRef) {
        if(!sectorState) {
            return null;
        }
        const {intileID, tile} = sectorState;
        const targetTile = this.tiles.find(tile2 => tile2.name === tile.tileName);
        if(targetTile) {
            return targetTile.sectors.find(sector => sector.intileID === intileID)
        }
    }

    getTileByName(name: string) {
        return this.tiles.find(tile => tile.name === name);
    }
}


