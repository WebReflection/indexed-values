'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {isArray} = Array;

// this utility just copy arrays and objects but nothing else
const copy = input => {
  if (typeof input === 'object') {
    if (isArray(input))
      input = input.map(copy);
    else if (input !== null) {
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
 * @param {string|string[]} targets paths to crawl through the object.
 * @param {function} callback a `callback(uid, field, value)` function, invoked per each target.
 * @param {Object} object a generic object literal to crawl via all targets.
 */
const crawlTargets = (targets, callback, object) => {
  for (let
    entries = [].concat(targets),
    i = 0, {length} = entries;
    i < length; i++
  )
    crawlTarget(callback, i, object, entries[i].split('.'));
};
exports.crawlTargets = crawlTargets;

const crawlTarget = (callback, index, object, path) => {
  for (let i = 0, {length} = path; i < length; i++) {
    const field = path[i];
    if ((i + 1) === length) {
      const real = field.endsWith('[]') ? field.slice(0, -2) : field;
      const override = callback(index, field, object[real]);
      if (typeof override !== 'undefined')
        object[real] = override;
    }
    else if (isArray(object[field])) {
      for (let
        nested = path.slice(i + 1),
        entries = object[field],
        j = 0, {length} = entries;
        j < length; j++
      )
        crawlTarget(callback, index, entries[j], nested);
      break;
    }
    else
      object = object[field];
  }
};

/**
 * @typedef {Object} PackedObject a literal object with `{_, $}` fields.
 * @property {array[]} _ all targets values as unique array.
 * @property {Object} $ an object where paths represent indexes of each `_` array value.
 */

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * Please note: this method **mutates** the entry `object`.
 * @param {string|string[]} targets paths to transform as indexed values.
 * @param {Object} object a JSON serializable object.
 * @returns {PackedObject}
 */
const packDirect = (targets, object) => {
  const _ = new Map;
  const callback = (id, field, values) => {
    if (field.endsWith('[]'))
      return values.map(callback.bind(null, id, ''));

    if (!_.has(id))
      _.set(id, new Map);

    const map = _.get(id);
    const indexes = [];
    for (let i = 0, {length} = values; i < length; i++) {
      if (!map.has(values[i]))
        map.set(values[i], map.size);
      indexes.push(map.get(values[i]));
    }
    return [indexes, id];
  };
  crawlTargets(targets, callback, object);
  return {_: [..._.values()].map(_ => [..._.keys()]), $: object};
};
exports.packDirect = packDirect;

/**
 * Given one or more target paths, returns a specialized object that can be
 * unpacked later on, through the indexed values grouped as unique IDs.
 * @param {string|string[]} targets paths to transform as indexed values.
 * @param {Object} object a JSON serializable object.
 * @returns {PackedObject}
 */
const packCopy = (targets, object) => packDirect(targets, copy(object));
exports.packCopy = packCopy;

/**
 * Given the same `targets` used to pack an object, returns the original object with
 * indexed values revived as original values.
 * Please note: this method **mutates** the passed `object` within the `$` field.
 * @param {string|string[]} targets paths to reach and revive indexes as values.
 * @param {PackedObject} object a previously packed object with indexes as paths values. 
 * @returns {Object}
 */
const unpackDirect = (targets, {_, $}) => {
  const callback = (id, field, values) => {
    if (field.endsWith('[]'))
      return values.map(callback.bind(null, id, ''));

    const [indexes, index] = values;
    return indexes.map(_[index].get, _[index]);
  };
  _ = _.map(indexes => indexes.reduce((map, v, i) => map.set(i, v), new Map));
  crawlTargets(targets, callback, $);
  return $;
};
exports.unpackDirect = unpackDirect;

/**
 * Given the same `targets` used to pack an object, returns a copy of the original object
 * with indexed values revived as original values.
 * @param {string|string[]} targets paths to reach and revive indexes as values.
 * @param {PackedObject} object a previously packed object with indexes as paths values. 
 * @returns {Object}
 */
const unpackCopy = (targets, {_, $}) => unpackDirect(targets, {_, $: copy($)});
exports.unpackCopy = unpackCopy;
