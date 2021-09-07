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
export function IndexedValues(values) {
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
