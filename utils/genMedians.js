// utils/genMedians.js
const path = require('svg-path-properties');
const fs = require('fs');

// 1. Paste your new stroke path string here:
const theNewStroke = "M 538 207 Q 584 217 634 224 Q 671 231 678 237 Q 687 244 683 252 Q 676 264 648 272 Q 623 278 538 254 L 488 242 Q 440 235 386 231 Q 350 227 375 210 Q 414 183 471 196 Q 477 197 488 199 L 538 207 Z"

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
