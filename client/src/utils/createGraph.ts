import type { Node } from '@backend/models/Node'
import { Queue } from '@datastructures-js/queue'
import {
    Direction,
    MIN_DIST_BETWEEN_NODES_X,
    MIN_DIST_BETWEEN_NODES_Y,
    NODE_HEIGHT,
    NODE_WIDTH,
} from '../components/pixi/constants'

export function createGraph() {
    return
}

// https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
export function hasCycle(graph: { [key: string]: Node }): boolean {
    const L: string[] = []
    const keys = Object.keys(graph)
    const indegrees: { [key: string]: number } = keys.reduce((acc: {[key: string]: number}, curr) => {
        acc[curr] = 0
        return acc
    }, {})

    for (const key of keys) {
        const node = graph[key]
        if (!node.links) continue
        for (const v of node.links) {
            if (!v.next) continue
            indegrees[v.next] = (indegrees[v.next] ?? 0) + 1
        }
    }
    const S: Queue<string> = new Queue(
        Object.keys(graph).filter((key: string) => indegrees[key] === 0)
    )
    while (!S.isEmpty()) {
        const n = S.pop()
        L.push(n)
        for (const v of graph[n].links) {
            const m = v.next
            indegrees[m]--
            if (indegrees[m] <= 0) {
                S.push(m)
            }
        }
    }

    const edgesRemaining: number = Object.values(indegrees).reduce(
        (curr, acc: number) => acc + curr,
        0
    )
    return edgesRemaining !== 0
}

function getCurvePoints(
    start: { x: number; y: number },
    end: { x: number; y: number }
): {
    start: { x: number; y: number; dir: Direction }
    end: { x: number; y: number; dir: Direction },
    cp: {x: number; y: number}[]
} {
    const startPos = [
        { x: start.x + NODE_WIDTH / 2, y: start.y - 10, dir: Direction.UP },
        { x: start.x + NODE_WIDTH + 10, y: start.y + NODE_HEIGHT / 2, dir: Direction.RIGHT },
        { x: start.x + NODE_WIDTH / 2, y: start.y + NODE_HEIGHT + 10, dir: Direction.DOWN },
        { x: start.x - 10, y: start.y + NODE_HEIGHT / 2, dir: Direction.LEFT },
    ]
    const endPos = [
        { x: end.x + NODE_WIDTH / 2, y: end.y - 10, dir: Direction.UP },
        {
            x: end.x + NODE_WIDTH + 10,
            y: end.y + NODE_HEIGHT / 2,
            dir: Direction.RIGHT,
        },
        {
            x: end.x + NODE_WIDTH / 2,
            y: end.y + NODE_HEIGHT + 10,
            dir: Direction.DOWN,
        },
        { x: end.x - 10, y: end.y + NODE_HEIGHT / 2, dir: Direction.LEFT },
    ]
    let min: number | undefined = undefined
    let shortestStart: { x: number; y: number; dir: Direction } = startPos[0];
    let shortestEnd: { x: number; y: number; dir: Direction } = endPos[0];
    for (const s of startPos) {
        for (const e of endPos) {
            const dist = Math.sqrt(
                Math.pow(s.x - e.x, 2) + Math.pow(s.y - e.y, 2)
            )
            if (!min || dist < min) {
                min = dist
                shortestStart = s
                shortestEnd = e
            }
        }
    }
    const is180Curve =  (
        (shortestStart.dir === Direction.UP && shortestEnd.dir === Direction.DOWN) ||
        (shortestStart.dir === Direction.DOWN && shortestEnd.dir === Direction.UP) ||
        (shortestStart.dir === Direction.LEFT && shortestEnd.dir === Direction.RIGHT) ||
        (shortestStart.dir === Direction.RIGHT && shortestEnd.dir === Direction.LEFT)
    );
    let cp: {x: number, y: number}[];
    if (!is180Curve) {
        cp = [{x: shortestEnd.x, y: shortestStart.y}];
    } else {
        const midX = (shortestEnd.x + shortestStart.x) / 2;
        const midY = (shortestEnd.y + shortestStart.y) / 2;
        if (shortestStart.dir === Direction.DOWN || shortestEnd.dir === Direction.DOWN) {
            cp = [{x: shortestStart.x, y: midY}, {x: shortestEnd.x, y: midY}];
        } else {
            cp = [{x: midX, y: shortestStart.y}, {x: midX, y: shortestEnd.y}];
        }
    }
    return { start: shortestStart, end: shortestEnd, cp }
}

export function processLayersToCoords(
    layers: Set<string>[],
    edgeLayers: string[][][]
): {
    nodes: { x: number; y: number; i: string }[]
    edges: { points: number[][]; isSimple: boolean; dir: Direction }[]
} {
    if (layers[0].size !== 1) {
        throw new Error('unexpected start layer')
    }
    let posY = 80 - NODE_HEIGHT / 2
    let nodes: { x: number; y: number; i: string }[] = []
    const edges: { points: number[][]; isSimple: boolean; dir: Direction }[] =
        []
    for (let i = 0; i < layers.length; i++) {
        const layer = []
        let posX =
            -(
                ((layers[i].size - 1) / 2) * NODE_WIDTH +
                (Math.max(layers[i].size - 1, 0) / 2) * MIN_DIST_BETWEEN_NODES_X
            ) -
            NODE_WIDTH / 2
        for (const node of layers[i]) {
            layer.push({ x: posX, y: posY, i: node })
            posX += NODE_WIDTH + MIN_DIST_BETWEEN_NODES_X
        }
        nodes = [...nodes, ...layer]
        posY += NODE_HEIGHT + MIN_DIST_BETWEEN_NODES_Y
    }
    for (let i = 0; i < edgeLayers.length; i++) {
        for (const edge of edgeLayers[i]) {
            if (!layers[i].has(edge[0]))
                throw new Error('Unexpected issue in creating edges')
            const isSimpleEdge = layers[i + 1]?.has(edge[1])
            const startNode = nodes.find((node) => node.i === edge[0])
            const endNode = nodes.find((node) => node.i === edge[1])
            if (!startNode || !endNode) continue;
            let startX: number;
            let startY: number;
            let endX: number;
            let endY: number;
            let dir: Direction = Direction.UP;
            let points: number[][];
            if (!isSimpleEdge) {
                const { start, end, cp } = getCurvePoints(startNode, endNode);
                startX = start.x
                startY = start.y
                endX = end.x
                endY = end.y
                dir = end.dir;
                points = [[startX, startY], ...cp.map(({x, y}) => [x, y]), [endX, endY]];
            } else {
                startX = startNode.x + NODE_WIDTH / 2;
                startY = startNode.y + NODE_HEIGHT + 10;
                endX = endNode.x + NODE_WIDTH / 2;
                endY = endNode.y - 10;
                const midX = (endX + startX) / 2;
                const midY = (endY + startY) / 2;
                points = [
                    [startX, startY],
                    [startX, midY],
                    [endX, midY],
                    [endX, endY],
                ];
            }
            edges.push({
                points,
                isSimple: isSimpleEdge,
                dir,
            })
        }
    }
    return { nodes, edges }
}

export function getWidthAndHeight(
    start: string,
    graph: { [key: string]: Node }
): { layers: Set<string>[]; edgeLayers: string[][][] } {
    if (hasCycle(graph)) {
        throw new Error("Can't get width and height for graph with cycle")
    }
    let q: Queue<string> = new Queue()
    q.push(start)
    const layers: Set<string>[] = []
    const visited: Set<string> = new Set()
    const edgeLayers = []
    while (!q.isEmpty()) {
        const layer: Set<string> = new Set()
        const edgeLayer: string[][] = []
        const nextQ: Queue<string> = new Queue()
        while (!q.isEmpty()) {
            const n = q.pop()
            if (visited.has(n)) continue
            layer.add(n)
            visited.add(n)
            const node = graph[n]
            node.links.forEach((e) => {
                edgeLayer.push([n, e.next])
                nextQ.push(e.next)
            })
        }
        if (layer.size > 0) layers.push(layer)
        if (edgeLayer.length > 0) edgeLayers.push(edgeLayer)
        q = nextQ
    }
    return { layers, edgeLayers }
}
