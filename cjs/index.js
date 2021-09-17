'use strict';
/*! (c) Andrea Giammarchi - ISC */

const {setPrototypeOf} = Object;
const {set} = Map.prototype;
const {iterator} = Symbol;

const empty = new Set;

const keys = new WeakMap;

const getKeys = map => {
  if (!keys.has(map))
    keys.set(map, [...map.keys()]);
  return keys.get(map);
};

class Keys extends Map {
  constructor(_) {
    super()._ = _;
  }
  delete(key) {
    const {_} = this._;
    return _.has(key) && super.delete(_.get(key));
  }
  get(key) {
    const {_} = this._;
    return _.has(key) ? super.get(_.get(key)) : void 0;
  }
  has(key) {
    const {_} = this._;
    return _.has(key) && super.has(_.get(key));
  }
  set(key, value) {
    return super.set(this._.add(key)._.get(key), value);
  }
  toJSON() { return [...super[iterator]()]; }
  *keys() { return yield *this._._.keys(); }
  *[iterator]() {
    const {_} = this._;
    for (const [key, value] of super[iterator]())
      yield [getKeys(_)[key], value];
  }
}
exports.Keys = Keys

class Indexes extends Set {
  constructor(_) {
    super()._ = _;
  }
  add(value) {
    return super.add(this._.add(value)._.get(value));
  }
  has(value) {
    const {_} = this._;
    return _.has(value) && super.has(_.get(value));
  }
  delete(value) {
    const {_} = this._;
    return _.has(value) && super.delete(_.get(value));
  }
  toJSON() { return [...this]; }
  *values() {
    const {_} = this._;
    for (const index of this)
      yield getKeys(_)[index];
  }
}

class IndexedValues extends Set {

  /**
   * Creates a Set where all values are stored as indexes, so that derived
   * sets can also use indexes instead of references as storage.
   * @param {any[]|Set<any>} values optional values to populate the Set
   */
  constructor(values = empty) {
    super()._ = new Map;
    for (const value of values)
      this.add(value);
  }

  /**
   * Returns a Set of indexes based on the Set it's generated from.
   * All operations work through value, and adding a new value is also
   * is reflected to the original set.
   * @param {number[]|Set<number>} indexes optional values to bind directly
   * @returns {Indexes}
   */
  bindIndexes(indexes = empty) {
    const set = new Indexes(this);
    for (const index of indexes) {
      if (super.has(index))
        super.add.call(set, index);
    }
    return set;
  }

  /**
   * Returns a Set of indexes based on the Set it's generated from.
   * All operations work through value, and adding a new value is also
   * is reflected to the original set.
   * @param {any[]|Set<any>} values optional values to bind directly
   * @returns {Indexes}
   */
  bindValues(values = empty) {
    const set = new Indexes(this);
    for (const value of values)
      set.add(value);
    return set;
  }

  /**
   * Returns a Map bound to this instance, where new keys will be
   * reflected to the original set.
   * @param {any[][]} entries a list of key/value pairs
   * @returns 
   */
  mapKeys(entries = empty) {
    const map = new Keys(this);
    for (const [key, value] of entries)
      map.set(key, value);
    return map;
  }

  /**
   * Returns a Map bound to this instance, where new keys will be
   * reflected to the original set.
   * This method should be used to revive some previously serialized map.
   * @param {any[][]} entries a previously serialized index/value list.
   * @returns 
   */
  mapEntries(entries = empty) {
    const map = new Keys(this);
    for (const [index, value] of entries)
      set.call(map, index, value);
    return map;
  }

  /**
   * Fast upgrade to a generic revived, or posted, set of indexes.
   * Note: this method mutates the prototype of the param, if it's a Set.
   * @param {number[]|Set<number>} indexes a stored Set of indexes or an array of indexes.
   * @returns 
   */
  fromIndexes(indexes) {
    const set = indexes instanceof Set ? indexes : new Set(indexes);
    set._ = this;
    return setPrototypeOf(set, Indexes.prototype);
  }

  /**
   * Fast upgrade to a generic revived, or posted, map of entries.
   * Note: this method mutates the prototype of the param, if it's a Map.
   * @param {any[][]} entries a stored map, or an array, of entries.
   * @returns 
   */
  fromEntries(entries) {
    const map = entries instanceof Map ? entries : new Map(entries);
    map._ = this;
    return setPrototypeOf(map, Keys.prototype);
  }

  add(value) {
    const {_} = this;
    if (!_.has(value)) {
      super.add(_.size);
      keys.delete(_.set(value, _.size));
    }
    return this;
  }

  has(value) {
    return this._.has(value);
  }

  delete() { throw new Error('Unable to delete'); }
  clear() { throw new Error('Unable to clear'); }

  toJSON() { return [...this]; }
  *entries() {
    for (const [value, index] of this._)
      yield [index, value];
  }
  *keys() { return yield *this._.values(); }
  *values() { return yield *this._.keys(); }
  *[iterator]() { return yield *this._.keys(); }
}
exports.IndexedValues = IndexedValues
