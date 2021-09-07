export const mapValues = array => array.reduce(
  (map, v, i) => map.set(v, i),
  new Map
);

export const mapIndexes = array => array.reduce(
  (map, i, v) => map.set(i, v),
  new Map
);
