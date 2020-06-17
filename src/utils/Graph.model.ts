import { IdComparable } from "./IdComparable.interface";

export enum GraphEdgeType {
    Oriented,
    NonOriented
}

export class GraphEdge<T extends IdComparable> {
    constructor(readonly start: T, readonly end: T, readonly type: GraphEdgeType = GraphEdgeType.NonOriented, readonly name = '') {

    }
}
export class Graph<T extends IdComparable> {
    private nodesMap = new Map<string, GraphEdge<T>[]>();

    addNode(node: T) {
        if (!this.nodesMap.has(node.comparableId)) {
            this.nodesMap.set(node.comparableId, []);
        }
        return this.nodesMap.get(node.comparableId);
    }

    addEdge(edge: GraphEdge<T>) {
        this.addSingleEdge(edge);
        if (edge.type === GraphEdgeType.NonOriented) {
            this.addSingleEdge(new GraphEdge(edge.end, edge.start));
        }
    }

    private addSingleEdge(edge: GraphEdge<T>) {
        const start = edge.start;
        const edges = this.addNode(start);
        if(edges.some(includedEdges => includedEdges.end.comparableId === edge.end.comparableId)) {
            return;
        }
        edges.push(edge);
        this.nodesMap.set(start.comparableId, edges);
    }

    removeEdge(edge: GraphEdge<T>) {
        const {start, end, type} = edge;
        this.removeSingleEdge(start, end);
        if(type === GraphEdgeType.NonOriented) {
            this.removeSingleEdge(end, start)
        }
    }

    private removeSingleEdge(start: T, end: T) {
        if (this.nodesMap.has(start.comparableId)) {
            const edges = this.nodesMap.get(start.comparableId).filter(edge => edge.end.comparableId !== end.comparableId);
            this.nodesMap.set(start.comparableId, edges);
        }
    }

    *edges() {
        const nodeMapsValues = this.nodesMap.values();
        for(const edges of nodeMapsValues) {
            for(const edge of edges) {
                yield edge;
            }
        }
    }

    stringify(nodeStringifyFn: (node: T) => string) {
        const output: string[] = [];
        const processedEdges: GraphEdge<T>[] = []
        for(const edge of this.edges()) {
            const isAlreadyProcessedNodes = processedEdges.some(otherEdge => {
                return (edge.start.comparableId === otherEdge.start.comparableId || edge.start.comparableId === otherEdge.end.comparableId) && (edge.end.comparableId === otherEdge.start.comparableId || edge.end.comparableId === otherEdge.start.comparableId);
            })
            if(!isAlreadyProcessedNodes || edge.type === GraphEdgeType.Oriented) {
                output.push(`${nodeStringifyFn(edge.start)}-${nodeStringifyFn(edge.end)}`);
                processedEdges.push(edge)
            }
        }
        return output.join(',');
    }

    getEndNodes(start: T) {
        if(this.nodesMap.has(start.comparableId)) {
            return this.nodesMap.get(start.comparableId).map(edge => edge.end);
        } else {
            return [];
        }
    }
    
    getEndNode(start: T, name: string) {
        if(!this.nodesMap.has(start.comparableId)) {
            return null;
        }
        const edge = this.nodesMap.get(start.comparableId).find(edge => edge.name === name);
        if(!edge) {
            return null;
        }
        return edge.end;
    }

    static fromEdges<T extends IdComparable>(edgeList: GraphEdge<T>[]) {
        const graph = new Graph<T>();
        for(const edge of edgeList) {
            graph.addEdge(edge);
        }
        return graph;
    }
    
    static parse<T extends IdComparable>(str: string, strToNodeFn: (str: string) => T) {
        const edgesStrList = str.split(',');
        const edges = edgesStrList.map(edgeStr => {
            const [startNodeStr, endNodeStr] = edgeStr.split('-');
            return new GraphEdge<T>(strToNodeFn(startNodeStr), strToNodeFn(endNodeStr));
        });
        return this.fromEdges(edges);
    }
}