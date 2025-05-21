// utils/genMedians.js
const path = require('svg-path-properties');
const fs = require('fs');

// 1. Paste your new stroke path string here:
const theNewStroke = "M 538 254 Q 538 291 540 345 L 541 390 Q 541 435 550 471 Q 551 487 540 496 Q 531 502 524 505 C 498 519 458 521 470 494 Q 485 470 486 396 Q 486 387 487 376 L 488 335 Q 488 292 488 242 L 490.431 223.421 Q 492.613 214.34 498.733 211.701 Q 505.082 209.503 513.873 210.113 Q 523.152 211.212 529.622 215.119 Q 535.238 218.782 537.26 226.985 L 538 254 Z"

const properties = new path.svgPathProperties(theNewStroke);

const L = properties.getTotalLength();

// 3. Decide how many median points you want
const POINTS = 5;
const medians = [];

for (let i = 0; i < POINTS; i++) {
  // distribute t from 0 to L
  const pt = properties.getPointAtLength((L * i) / (POINTS - 1));
  medians.push([ Math.round(pt.x), Math.round(pt.y) ]);
}

// 4. Output JSON snippet
console.log(JSON.stringify(medians, null));

// (Optionally write back into your character JSON file)
