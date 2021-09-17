import {IndexedValues} from '../esm/index.js';
class Serializable extends Set {
  toJSON() { return [...this]; }
}

addEventListener('message', ({data}) => {
  const {strings, related, useIndexes} = data;
  if (useIndexes) {
    data.strings = new IndexedValues(strings);
    data.related = related.map(list => data.strings.bindIndexes(list));
  }
  else {
    data.strings = new Serializable(strings);
    data.related = related.map(list => new Serializable(list));
  }
  self.data = data;
  postMessage({strings, related});
});
