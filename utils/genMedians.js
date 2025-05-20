// utils/genMedians.js
const path = require('svg-path-properties');
const fs = require('fs');

// 1. Paste your new stroke path string here:
const theNewStroke = "M 538 -1107 Q 584 -1117 634 -1124 Q 671 -1131 678 -1137 Q 687 -1144 683 -1152 Q 676 -1164 648 -1172 Q 623 -1178 538 -1154 L 488 -1142 Q 440 -1135 386 -1131 Q 350 -1127 375 -1110 Q 414 -1083 471 -1096 Q 477 -1097 488 -1099 L 538 -1107 Z"

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
