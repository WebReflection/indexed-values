import {get, set} from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';
import {IndexedValues} from '../esm/index.js';

class Serializable extends Set {
  toJSON() { return [...this]; }
}

const revive = data => {
  const {strings, related, useIndexes} = data;
  if (useIndexes) {
    data.strings = new IndexedValues(strings);
    data.related = related.map(list => data.strings.bindIndexes(list));
  }
  else {
    data.strings = new Serializable(strings);
    data.related = related.map(list => new Serializable(list));
  }
  return data;
};

console.time('getting data');
get('data').then(data => {
  console.timeEnd('getting data');
});

addEventListener('message', ({data}) => {
  console.log(data.data);
  console.time('storing data');
  set('data', data).then(() => {
    console.timeEnd('storing data');
    console.time('reviving data');
    self.data = revive(data);
    console.timeEnd('reviving data');
    postMessage(self.data);
  });
});
