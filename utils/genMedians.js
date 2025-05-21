// utils/genMedians.js
const simplify = require('./external/simplify/1.2.2/simplify');
const { assert, Point } = require('./base');
const { svg } = require('./svg');
const Voronoi    = require('./external/voronoi/0.98/rhill-voronoi-core.js');
// const Voronoi = require('voronoi');

// Canvas dimensions (same as Hanzi Writer)
const CANVAS_SIZE = 1024;
const Y_RISE      = 900;
const MATCH_POINTS = 8;

/**
 * Uniformly resample a polyline `median` down to `n` points along its arc-length.
 */
function filterMedian(median, n) {
  // compute segment lengths
  const distances = median.slice(0, -1).map((p, i) =>
    Math.hypot(
      median[i+1][0] - p[0],
      median[i+1][1] - p[1]
    )
  );
  const total = distances.reduce((sum, d) => sum + d, 0);

  const result = [];
  let index = 0;
  let pos   = median[0].slice();
  let acc   = 0;

  for (let i = 0; i < n - 1; i++) {
    const target = (total * i) / (n - 1);
    while (acc < target && index < median.length - 1) {
      const segLen = Math.hypot(
        median[index+1][0] - pos[0],
        median[index+1][1] - pos[1]
      );
      if (acc + segLen < target) {
        acc += segLen;
        index++;
        pos = median[index].slice();
      } else {
        const t = (target - acc) / segLen;
        pos = [
          pos[0] + t * (median[index+1][0] - pos[0]),
          pos[1] + t * (median[index+1][1] - pos[1])
        ];
        acc = target;
      }
    }
    result.push([pos[0], pos[1]]);
  }
  // Ensure last point matches
  result.push(median[median.length - 1].slice());
  return result;
}

/**
 * Depth-first: find the longest shortest-path from `node`.
 */
function findPathFromFurthestNode(adjacency, vertices, node, visited = {}) {
  visited[node] = true;
  let best = { path: [], distance: 0 };
  for (const nb of adjacency[node] || []) {
    if (!visited[nb]) {
      const cand = findPathFromFurthestNode(adjacency, vertices, nb, visited);
      cand.distance += Math.hypot(
        vertices[node][0] - vertices[nb][0],
        vertices[node][1] - vertices[nb][1]
      );
      if (cand.distance > best.distance) best = cand;
    }
  }
  best.path.push(node);
  return best;
}

/**
 * Two-run trick: A→furthest=B, then B→furthest=C gives diameter path.
 */
function findLongestShortestPath(adjacency, vertices, root) {
  const first = findPathFromFurthestNode(adjacency, vertices, root);
  const second = findPathFromFurthestNode(adjacency, vertices, first.path[0]);
  return second.path;
}

/**
 * Compute the geometric median-line (skeleton) of an SVG stroke.
 * Returns an array of [x,y] centerline points.
 */
function findStrokeMedian(stroke) {
  // 1) Convert path to simple polygon
  const paths = svg.convertSVGPathToPaths(stroke);
  assert(paths.length === 1, `Expected one loop, got ${paths.length}`);
  let polygon, diagram;
  // 2) Voronoi of boundary points (two levels of approx)
  for (const res of [16, 64]) {
    polygon = svg.getPolygonApproximation(paths[0], res);
    const vor = new Voronoi();
    diagram = vor.compute(
      polygon.map(p => ({ x: p[0], y: p[1] })),
      { xl: -CANVAS_SIZE, xr: CANVAS_SIZE, yt: -CANVAS_SIZE, yb: CANVAS_SIZE }
    );
    if (diagram) { voronoi = vor; break; }
  }
  assert(diagram, 'Voronoi failed');

  // 3) Keep only interior vertices & build adjacency
  diagram.vertices.forEach((v, i) => {
    v.include = svg.polygonContainsPoint(polygon, [v.x, v.y]);
    v.idx = i;
  });
  const vertices = diagram.vertices.map(v => [Math.round(v.x), Math.round(v.y)]);

  const edges = diagram.edges
    .map(e => [e.va.idx, e.vb.idx])
    .filter(([a,b]) => diagram.vertices[a].include && diagram.vertices[b].include);
  voronoi.recycle(diagram);

  const adjacency = {};
  edges.forEach(([a,b]) => {
    (adjacency[a] = adjacency[a]||[]).push(b);
    (adjacency[b] = adjacency[b]||[]).push(a);
  });

  // 4) Extract longest path through skeleton
  const root = edges[0][0];
  const path = findLongestShortestPath(adjacency, vertices, root);
  const points = path.map(i => vertices[i]);

  // 5) Simplify tiny zig-zags
  const simplified = simplify(points.map(p => ({ x: p[0], y: p[1] })), 4);
  return simplified.map(p => [p.x, p.y]);
}

/**
 * Normalize the median line to [0,1]×[0,1] with fixed point count.
 */
function normalizeForMatch(median) {
  // 1) Resample to MATCH_POINTS
  const filtered = filterMedian(median, MATCH_POINTS);
  // 2) Scale into unit square, flipping y
  return filtered.map(([x,y]) => [
    x / CANVAS_SIZE,
    (Y_RISE - y) / CANVAS_SIZE
  ]);
}

// 1. Replace with your stroke data or read from file
  const STROKE = 
   "M 602 639 Q 645 641 647 668 Q 638 691 576 686 Q 550 682 528 679 C 487 681 494 641 509 638 Q 543 636 577 638 L 602 639 Z"

if (require.main === module) {

  const raw = findStrokeMedian(STROKE);

  // sometimes reverse, sometimes not. I dont know... the reverse seems like the 筆順
  raw.reverse();
  // const norm= normalizeForMatch(raw);
  console.log('raw medians:', JSON.stringify(raw, null));
  // console.log('normalized:', JSON.stringify(norm, null));
}

module.exports = { findStrokeMedian, normalizeForMatch };
