'use strict';
/*! (c) Andrea Giammarchi - ISC */

/**
 * Transform a list of values, or indexes, into
 * a list of values, or indexes, counterpart.
 * @param {Array|AsJSONIndexes} self
 * @param {any[]} values
 * @param {Map} map
 * @returns {Array|AsJSONIndexes}
 */
const transform = (self, values, map) => {
  for (const value of values)
    self.push(map.get(value));
  return self;
};

/**
 * Returns a new Array like class that will provide JSON
 * serialization and deserialization via indexes.
 * @param {Array|Set} values a list of values to refer by indexes.
 * @returns {AsJSONIndexes}
 */
function IndexedValues(values) {
  const asIndexes = new Map;
  const asValues = new Map;

  // map indexes/values by reference once
  // which *should* not increase in any
  // meaningful way, the HEAP consumption,
  // except for the generated, numeric, indexes
  let i = 0;
  for (const value of values) {
    asIndexes.set(value, i);
    asValues.set(i++, value);
  }

  // returns an Array like class that is capable of
  // serializing, and de-serialize, re-mapping
  // all known references by indexes
  return class AsJSONIndexes extends Array {

    /**
     * Returns a new AsJSONIndexes array of values, given a list
     * of indexes, derived from the initial values.
     * @param {Array|Set} indexes a list of indexes related to the `values`.
     * @returns {AsJSONIndexes}
     */
    static fromJSON(indexes) {
      return transform(new this, indexes, asValues);
    }

    /**
     * Returns a new Array with all values mapped as indexes,
     * derived from the initial values.
     * @returns {Array}
     */
    toJSON() {
      return transform([], this, asIndexes);
    }
  };
}
exports.IndexedValues = IndexedValues

/**
 * @template Serializable
 * @param {Serializable} ref The first object of the callback.
 * @return {Serializable}
 */

/**
 * @typedef {Object} MainTargetPaths a literal object with `{main, target}` fields.
 * @property {string} main the path where to find the source of values, used in all targets.
 * @property {string} target the path where to find all targets that contain values from the `main` list.
 */

/**
 * Given a reference object either to stringify or parse, and one or more `main` / `target` entries,
 * automatically find and transform all targets into serializable, or original, entries.
 * @param {string} method either `from` or `fromJSON`, used to transform all targets.
 * @param {Serializable} ref the object to serialize.
 * @param {MainTargetPaths|MainTargetPaths[]} targets the object with `main` and `target` path to revive.
 * @returns {Serializable}
 */
const upgradeVia = (method, ref, targets) => {
  for (const {main, target} of [].concat(targets)) {
    const list = main.split('.').reduce((o, k) => o[k], ref);
    upgradeTargets(IndexedValues(list), method, ref, target.split('.'));
  }
  return ref;
};

/**
 * Crawl from a root all fields defined in `path`, recursively looping through arrays,
 * if found during such crawling.
 * @param {AsJSONIndexes} Array the class returned via IndexedValues.
 * @param {string} method either `from` or `fromJSON`.
 * @param {object} root the object to serialize.
 * @param {string[]} path a list of fields to crawl to reach all targets.
 */
const upgradeTargets = (Array, method, root, path) => {
  for (let i = 0, {length} = path; i < length; i++) {
    if ((i + 1) === length) {
      if (path[i].endsWith('[]')) {
        root = root[path[i].slice(0, -2)];
        for (let j = 0; j < root.length; j++)
          root[j] = Array[method](root[j]);
      }
      else
        root[path[i]] = Array[method](root[path[i]]);
    }
    else if (Array.isArray(root[path[i]])) {
      const nested = path.slice(i + 1);
      for (const entry of root[path[i]])
        upgradeTargets(Array, method, entry, nested);
      break;
    }
    else
      root = root[path[i]];
  }
};

/**
 * Given a `JSON.parse(...)` result, revive indexed targets via the main Array.
 * @param {Serializable} ref the object to serialize.
 * @param {MainTargetPaths|MainTargetPaths[]} targets the object with `main` and `target` path to revive.
 * @returns {Serializable}
 */
const fromJSON = (ref, targets) => upgradeVia('fromJSON', ref, targets);
exports.fromJSON = fromJSON;

/**
 * Given an object to `JSON.stringify(...)`, augment all targets in a way that,
 * once serialized, will produce indexed arrays through the targets' `main` Array's path.
 * @param {Serializable} ref the object to serialize.
 * @param {MainTargetPaths|MainTargetPaths[]} targets the object with `main` and `target` path to serialize.
 * @returns {Serializable}
 */
const toJSON = (ref, targets) => upgradeVia('from', ref, targets);
exports.toJSON = toJSON;
