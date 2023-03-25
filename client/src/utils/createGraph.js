"use strict";
exports.__esModule = true;
exports.getWidthAndHeight = exports.hasCycle = exports.createGraph = void 0;
var queue_1 = require("@datastructures-js/queue");
function createGraph() {
    return;
}
exports.createGraph = createGraph;
// Kahns Algorithm
function hasCycle(start, graph) {
    var S = new queue_1.Queue(Object.values(graph).filter(function (node) { return node.links.length == 0; }));
    while (!S.isEmpty()) {
        var n = S.pop();
        for (var _i = 0, _a = n.links; _i < _a.length; _i++) {
            var v = _a[_i];
            var m = graph[v.next];
        }
    }
    return false;
}
exports.hasCycle = hasCycle;
function getWidthAndHeight(start, graph) {
    if (hasCycle(start, graph)) {
        throw new Error("Can't get width and height for graph with cycle");
    }
    var q = new queue_1.Queue();
    q.push(start);
    var layers = [];
    var visited = new Set();
    var _loop_1 = function () {
        var layer = [];
        var nextQ = new queue_1.Queue();
        while (!q.isEmpty()) {
            var n = q.pop();
            layer.push(n);
            var node = graph[n];
            node.links.forEach(function (e) {
                nextQ.push(e.next);
            });
        }
        layers.push(layer);
        q = nextQ;
    };
    while (!q.isEmpty()) {
        _loop_1();
    }
    visited = new Set();
    for (var i = layers.length - 1; i >= 0; i--) {
        for (var j = layers[i].length - 1; j >= 0; j--) {
            if (visited.has(layers[i][j])) {
                layers[i].splice(j, 1);
                continue;
            }
            visited.add(layers[i][j]);
        }
    }
    return layers;
}
exports.getWidthAndHeight = getWidthAndHeight;
