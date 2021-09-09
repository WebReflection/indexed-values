'use strict';
/*! (c) Andrea Giammarchi - ISC */

const LIST = '[]';
const EMPTY = '';
const OPTIONAL = '?';

const {iterator} = Symbol;

// copy objects/arrays and transform iterables in arrays
const copy = input => {
  if (typeof input === 'object' && input) {
    if (iterator in input) {
      const values = [];
      for (const value of input)
        values.push(copy(value));
      input = values;
    }
    else {
      const output = {};
      for (const key in input)
        output[key] = copy(input[key]);
      input = output;
    }
  }
  return input;
};

/**
 * Recursively crawls paths, branching when arrays are in the middle.
 * Invoke the callback at the end with a unique Map index/id, the field name,
 * and the value of such field. If the callback returns a new value, it
 * overrides the original field with it.
 * @param {string[]} targets paths to crawl through the object.
 * @param {function} callback a `callback(uid, field, value)` function, invoked per each target.
 * @param {Object} object a generic object literal to crawl via all targets.
 */
const crawlTargets = (targets, callback, object) => {
  let i = 0;
  const re = /(\?|\[\])?\./g;
  for (const target of targets) {
    const path = [];
    let j = 0;
    let match = null;
    let optional = EMPTY;
    while (match = re.exec(target + '.')) {
      const {0: {length}, 1: hint, index} = match;
      if (index - j)
        path.push([target.slice(j, index), hint || EMPTY]);
      else
        optional = hint;
      j = index + length;
    }
    crawlTarget(callback, i++, optional, object, path);
  }
};
exports.crawlTargets = crawlTargets;

const crawlTarget = (callback, id, optional, object, path) => {
  for (let {length} = path, i = 0; i < length;) {
    const [field, hint] = path[i++];
    if (object[field] == null) {
      if (optional === OPTIONAL)
        break;
      throw new Error('invalid field ' + field);
    }
    if (i === length) {
      const info = {id, field, hint, optional: optional === OPTIONAL};
      const override = callback(info, object[field]);
      if (typeof override !== 'undefined')
        object[field] = override;
      break;
    }
    optional = hint;
    object = object[field];
    if (hint === LIST || iterator in object) {
      const sub = path.slice(i);
      for (const value of object)
        crawlTarget(callback, id, optional, value, sub);
      break;
    }
  }
};

/**
 * @typedef {[array[], object]} PackedResult an array with values as first entry,
 * and the optimized object as second one.
 */

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * Please note: this method **mutates** the entry `object`.
 * @param {string[]} targets paths to transform as indexed values.
 * @param {Array|Object} object a JSON serializable object.
 * @returns {PackedResult}
 */
const packDirect = (targets, object) => {
  const _ = new Map;
  const callback = ({id, hint}, target) => {
    if (!_.has(id))
      _.set(id, new Map);
    const map = _.get(id);
    const result = [];
    const all = hint === LIST;
    for (const values of all ? target : [target]) {
      const indexes = [];
      for (const value of values) {
        if (!map.has(value))
          map.set(value, map.size);
        indexes.push(map.get(value));
      }
      result.push([indexes, id]);
    }
    return all ? result : result.shift();
  };
  crawlTargets(targets, callback, object);
  return [[..._.values()].map(_ => [..._.keys()]), object];
};
exports.packDirect = packDirect;

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * @param {string[]} targets paths to transform as indexed values.
 * @param {Array|Object} object a JSON serializable object.
 * @returns {PackedResult}
 */
const packCopy = (targets, object) => packDirect(targets, copy(object));
exports.packCopy = packCopy;

/**
 * Given the same `targets` used to pack an object, returns the original object with
 * indexed values revived as original values.
 * Please note: this method **mutates** the passed `object` within the `$` field.
 * @param {string[]} targets paths to reach and revive indexes as values.
 * @param {PackedResult} array
 * @returns {Array|Object}
 */
const unpackDirect = (targets, [_, $]) => {
  const callback = ({hint}, target) => {
    const result = [];
    const all = hint === LIST;
    for (const [indexes, index] of all ? target : [target])
      result.push(indexes.map(_[index].get, _[index]));
    return all ? result : result.shift();
  };
  _ = _.map(indexes => indexes.reduce((map, v, i) => map.set(i, v), new Map));
  crawlTargets(targets, callback, $);
  return $;
};
exports.unpackDirect = unpackDirect;

/**
 * Given the same `targets` used to pack an object, returns a copy of the original object
 * with indexed values revived as original values.
 * @param {string[]} targets paths to reach and revive indexes as values.
 * @param {PackedResult} array
 * @returns {Array|Object}
 */
const unpackCopy = (targets, [_, $]) => unpackDirect(targets, [_, copy($)]);
exports.unpackCopy = unpackCopy;
