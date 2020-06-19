import { CircleGeometry, Texture, Mesh, Vector2, MeshStandardMaterial, Group, CylinderGeometry, MeshPhongMaterial, DoubleSide, CylinderBufferGeometry, BackSide } from "three";
import { MathUtils } from "../../../utils/Math.utils";
import { GameObject } from "../../game-object/GameObject.model";
import { GameObjectProducer } from "../../game-object/GameObjectProducer.model";
import { TileSector } from "./TileSector.model";
import { Graph } from "../../../utils/Graph.model";
import { TileNode } from "./TileNode.model";
import { v4 } from "uuid";
import { SelectableGameObject } from "../../game-object/selectable/Selectable.decorator";
import { RaycastSelection } from "../../game-object/selectable/impl/RaycastSelection.model";
import { TileMaterial, ForceTileHighlightType } from "../../../shaders/materials/TileMaterial.factory";
import { TilePosition } from "../TilePosition.model";
import { ObjectsRenderingOrder } from "../../GameConstants.utils";
import { MapSector } from "../MapSector.model";
import { TileState } from "../../../state/GameState.interface";

export interface TileProducerOptions {
    width: number,
    tileFaceTexture: Texture,
    tileFace: Mesh,
    tileBackTexture: Texture,
    sectorMapTex: Texture,
    sectors: TileSector[],
    graph: Graph<TileNode>,
    cloudTexture: Texture,
    name: string,
    type: TileType
}

export enum TileType {
    None,
    Safe,
    Dangerous
}

export const TileProducer = new GameObjectProducer((options: TileProducerOptions) => {
    const { tileBackTexture, tileFace, tileFaceTexture, width, sectors, graph, sectorMapTex, cloudTexture, name, type } = options;
    const tile = new Tile(width);
    tile.tileFaceTexture = tileFaceTexture;
    tile.tileBackTexture = tileBackTexture;
    tile.tileFaceMesh = tileFace;
    tile.sectors = sectors;
    sectors.forEach(sector => sector.tile = tile);
    tile.graph = graph;
    for (const edge of graph.edges()) {
        const { start } = edge;
        start.tile = tile;
    }
    tile.sectorMapTexture = sectorMapTex;
    tile.cloudTexture = cloudTexture;
    tile.name = name;
    tile.isFlipped = !tileBackTexture;
    tile.type = type;
    return tile;
});
@SelectableGameObject(RaycastSelection)
export class Tile extends GameObject {
    id = v4();
    tileFaceTexture: Texture;
    tileBackTexture: Texture;
    tileFaceMesh: Mesh;
    sectors: TileSector[];
    graph: Graph<TileNode>;
    sectorMapTexture: Texture;
    cloudTexture: Texture;
    isFlipped: boolean = false;

    type: TileType = TileType.None;

    position: TilePosition;

    name: string;

    constructor(public width: number) {
        super();
    }

    setReceiveShadowState(value: boolean) {
        this.tileFaceMesh.receiveShadow = value;
    }

    setFOWThreshold(value: number) {
        const material = this.tileFaceMesh.material as TileMaterial;
        material.FOWThreshold = value;
    }

    startMaterialAnimation() {
        this.getMaterial().startTimer();
    }

    stopMaterialAnimation() {
        this.getMaterial().stopTimer();
    }

    enableHighlight() {
        const material = this.getMaterial();
        material.enableColorHighlight = true;
        material.startTimer();
        if(!this.isFlipped) {
            material.forceTileHighlightMode = ForceTileHighlightType.None;
        }
    }

    disableHighlight() {
        const material = this.getMaterial();
        material.stopTimer();
        material.highlightedColors = [];
        material.forceTileHighlightMode = ForceTileHighlightType.Disabled;
        material.enableColorHighlight = false;
    }

    highlightSectors(sectors: MapSector[]) {
        const material = this.getMaterial();
        const highlightedColors = [];
        material.forceTileHighlightMode = ForceTileHighlightType.Disabled;
        if (!this.isFlipped) {
            material.forceTileHighlightMode = sectors.some(sector => sector.tile === this) ? ForceTileHighlightType.All : ForceTileHighlightType.None;
        } else {
            for (const sector of sectors) {
                if (sector.tile === this) {
                    highlightedColors.push(...sector.highlightColors);
                }
            }
            material.highlightedColors = highlightedColors;
        }
    }

    factoryMesh() {
        const group = new Group();
        const faceTexCopy = this.tileFaceTexture.clone();
        faceTexCopy.anisotropy = 16;
        const faceMesh = this.tileFaceMesh;
        faceMesh.scale.set(this.width, this.width, this.width);
        faceTexCopy.needsUpdate = true;
        faceMesh.material = new TileMaterial(faceTexCopy, this.sectorMapTexture, this.tileBackTexture, this.cloudTexture);
        const baseGeom = new CylinderBufferGeometry(this.width, this.width, 20, 6, 32);
        const baseMesh = new Mesh(baseGeom, new MeshPhongMaterial({
            color: 0x666666,
            side: DoubleSide
        }));
        baseMesh.rotation.set(MathUtils.toRad(90), MathUtils.toRad(90), 0);
        faceMesh.rotation.set(0,0,MathUtils.toRad(90));
        //baseMesh.rotateX(MathUtils.toRad(90));
        baseMesh.translateY(-11);

        group.add(baseMesh);
        group.add(faceMesh);
        //group.rotateZ(MathUtils.toRad(90));
        group.translateZ(6)
        faceMesh.renderOrder = ObjectsRenderingOrder.TileOrder;
        baseMesh.renderOrder = ObjectsRenderingOrder.TileOrder;
        group.name = 'Tile';
        baseMesh.castShadow = true;
        group.matrixAutoUpdate = false;
        return group;
    }

    getState(): TileState {
        return {
            tileName: this.name,
            isFlipped: this.isFlipped,
            position: this.position
        }
    }

    private getMaterial(): TileMaterial {
        return this.tileFaceMesh.material as TileMaterial;
    }

}