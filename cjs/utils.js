'use strict';
const mapValues = array => array.reduce(
  (map, v, i) => map.set(v, i),
  new Map
);
exports.mapValues = mapValues;

const mapIndexes = array => array.reduce(
  (map, i, v) => map.set(i, v),
  new Map
);
exports.mapIndexes = mapIndexes;
