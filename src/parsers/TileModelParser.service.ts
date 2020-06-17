import { Injectable } from "injection-js";
import { FileLoader, Texture, Color, Vector2 } from "three";
import { TileSector, SectorModification, EncounterType, EncounterPlace } from "../game/map/tiles/TileSector.model";
import { TileEdgeNode, TileNode, createTileEdgeNodes } from "../game/map/tiles/TileNode.model";
import { Graph, GraphEdge } from "../utils/Graph.model";
import { HexagonUtils } from "../utils/Hexagon.util";
import { getColorHash } from "../utils/Color.utils";
import { ImageModelParser } from "./utils/ImageColorParser.model";
import { getImageData } from "../utils/Image.utils";
import FileSystem = require('fs');

const GRAPH_KEYWORD_STR = 'GRAPH';

@Injectable()
export class TileModelParser {
    private fileLoader: FileLoader = new FileLoader();
    async parse(path: string, sectorMap: Texture) {
        let fileContent: string;
        try {
            fileContent = await this.load(path) as string;
        } catch (err) {
            throw err;
        }
        const lines = fileContent.split('\n').filter(line => line.length > 0);
        const isGraphPresented = lines.some(line => line.startsWith(GRAPH_KEYWORD_STR));
        const image = sectorMap.image as HTMLImageElement;
        const imageData = getImageData(image);
        const noGraphLines = lines.filter(line => !line.startsWith(GRAPH_KEYWORD_STR));
        const sectors = noGraphLines.map((line, index) => this.parseTileLine(line, index, imageData));
        let graph: Graph<TileNode>;
        if (!isGraphPresented) {
            const initialGraph = this.createTileGraph(sectors);
            graph = this.removeInvalidEdges(initialGraph, imageData);
            const graphStr = graph.stringify(node => {
                return node.sector ? `${node.sector.intileID}` : `e${node.edgeNode.edgeNumber * 2 + node.edgeNode.edgePartId}`;
            });
            console.log(path, graphStr);
            const totalLines = noGraphLines.concat(['GRAPH'+graphStr])
            FileSystem.writeFile(`public/${path}`, totalLines.join('\n'), err => {
                if(err) {
                    console.error(err)
                }
            })
        } else {
            const graphLine = lines.find(line => line.startsWith(GRAPH_KEYWORD_STR));
            const graphStr = graphLine.slice(GRAPH_KEYWORD_STR.length);
            const nodeCacheMap = new Map<string, TileNode>();
            graph = Graph.parse<TileNode>(graphStr, tileNodeStr => {
                if (nodeCacheMap.has(tileNodeStr)) {
                    return nodeCacheMap.get(tileNodeStr)
                }
                let item: TileSector | TileEdgeNode;
                if (tileNodeStr.startsWith('e')) {
                    const subEdgeNumber = Number.parseInt(tileNodeStr.slice(1));
                    const edgeNumber = Math.floor(subEdgeNumber / 2);
                    const subEdgeId = subEdgeNumber % 2;
                    item = new TileEdgeNode(edgeNumber, subEdgeId);
                } else {
                    const sectorNumber = Number.parseInt(tileNodeStr);
                    item = sectors.find(sector => sector.intileID === sectorNumber);
                }
                const node = new TileNode(item);
                nodeCacheMap.set(tileNodeStr, node)
                return node;
            })
        }
        return {
            sectors,
            graph
        }
    }

    private createTileGraph(sectors: TileSector[]): Graph<TileNode> {
        const edgesNodes = createTileEdgeNodes();
        const totalNodes = edgesNodes.concat(sectors.map(sector => new TileNode(sector)));
        const tileGraph = new Graph<TileNode>();
        for (const node of totalNodes) {
            tileGraph.addNode(node);
            for (const otherNode of totalNodes) {
                if (otherNode.comparableId !== node.comparableId) {
                    tileGraph.addEdge(new GraphEdge(node, otherNode));
                }
            }
        }
        return tileGraph;
    }

    private removeInvalidEdges(graph: Graph<TileNode>, sectorMap: ImageData) {
        const newGraph = new Graph<TileNode>();
        const imageColorParser = new ImageModelParser(sectorMap, 20, 20);
        for (const edge of graph.edges()) {
            const isStartGraphEdgeTileEdge = !!edge.start.edgeNode;
            const isEndGraphEdgeTileEdge = !!edge.end.edgeNode
            if (isStartGraphEdgeTileEdge && isEndGraphEdgeTileEdge) {
                continue;
            } else if (isStartGraphEdgeTileEdge || isEndGraphEdgeTileEdge) {
                const tileEdge = edge.start.edgeNode || edge.end.edgeNode;
                const sector = edge.start.sector || edge.end.sector;
                const tileEdgeIndex = tileEdge.edgeNumber;
                const hexagonCenter = new Vector2(sectorMap.width / 2, (sectorMap.height - 4) / 2);
                const tileStart = HexagonUtils.getEdgeCoordinates(tileEdgeIndex, sectorMap.width, hexagonCenter), tileEnd = HexagonUtils.getEdgeCoordinates(tileEdgeIndex + 1, sectorMap.width, hexagonCenter);
                const tileMidPoint = new Vector2().addVectors(tileStart, tileEnd).multiplyScalar(.5);
                const scaleDownParam = .95;
                const scaledTileStart = new Vector2().lerpVectors(hexagonCenter, tileEdge.edgePartId === 0 ? tileStart : tileMidPoint, scaleDownParam), scaledTileEnd = new Vector2().lerpVectors(hexagonCenter, tileEdge.edgePartId === 0 ? tileMidPoint : tileEnd, scaleDownParam);
                const parsedColors: string[] = this.getColorsListBetweenPoints(0.1, scaledTileStart, scaledTileEnd, imageColorParser);
                const sectorColorStr = getColorHash(sector.colorCode);
                if (parsedColors.includes(sectorColorStr)) {
                    newGraph.addEdge(edge);
                }
            } else {
                const sector1 = edge.start.sector;
                const sector2 = edge.end.sector;
                const result = imageColorParser.getRegionsWithColors([sector1.colorCode, sector2.colorCode]);
                if (result.length > 0) {
                    newGraph.addEdge(edge);
                }
            }
        }
        return newGraph;
    }

    private getColorsListBetweenPoints(testStep: number, scaledTileStart: Vector2, scaledTileEnd: Vector2, colorParser: ImageModelParser) {
        const testItersCount = 1 / testStep;
        const parsedColors: string[] = [];
        for (let i = 0; i < testItersCount; i++) {
            const position = new Vector2().lerpVectors(scaledTileStart, scaledTileEnd, testStep * i);
            const colors = colorParser.getColorsForPoint(position);
            parsedColors.push(...colors.map(color => getColorHash(color)));
        }
        return parsedColors;
    }

    private parseTileLine(line: string, lineIndex: number, sectorMap: ImageData) {
        let openBracketsCount = 0;
        const items = [];
        const {height, width} = sectorMap;
        let acc = '';
        for (let i = 0; i < line.length; i++) {
            const char = line.charAt(i);
            if (char === '(') {
                openBracketsCount++;
            }
            if (char === ')') {
                openBracketsCount--;
            }
            if (char === ',' && openBracketsCount === 0) {
                items.push(acc.trim());
                acc = '';
            } else {
                acc += char;
            }
        }
        if (acc.length > 0) {
            items.push(acc.trim())
        }
        if (items.length === 5) {
            const [colorStr, centerStr, sectorModStr, encounterStr, enemyTypeStr] = items;
            const [centerX, centerY] = JSON.parse(centerStr.replace(/\(/g, "[").replace(/\)/g, "]"));
            return new TileSector(
                lineIndex,
                new Color(`rgb${colorStr}`),
                new Vector2((centerX - width/2)/width, (centerY - height/2)/width),
                sectorModStr === 'RADIATION' ? SectorModification.Radiation : SectorModification.Mountain,
                this.parseSectorEncounterPlace(encounterStr),
                enemyTypeStr
            )
        } else {
            throw new Error(`Line ${line} missing all arguments (Color, CenterXY, SectorMod, EncType, EnemyType)`)
        }
    }

    private parseSectorEncounterPlace(encounterStr: string): EncounterPlace {
        if (encounterStr === 'NONE') {
            return null;
        }
        const [type, level] = encounterStr.split(' ');
        return {
            type: type === 'CITY' ? EncounterType.City : EncounterType.Wasteland,
            level: Number.parseInt(level)
        }

    }

    private load(filePath: string) {
        return new Promise<string | ArrayBuffer>((resolve, reject) => {
            this.fileLoader.load(filePath, resolve, null, reject);
        })
    }
}