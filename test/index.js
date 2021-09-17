const {IndexedValues} = require('../cjs');

const assert = (a, b, m = `\n \x1b[1mexpected\x1b[0m ${b}\n \x1b[1mreceived\x1b[0m ${a}`) => {
  console.assert(a === b, m);
  if (a !== b)
    process.exit(1);
};

const iv = new IndexedValues(['a', 'b', 'c']);
const s1 = iv.bindValues(['a', 'c']);
const s2 = iv.bindValues(['b']);
const s3 = iv.bindIndexes([0, 1]);
const m1 = iv.mapKeys([['a', 'letter a'], ['b', 'letter b']]);

assert([...iv].join(','), 'a,b,c');
assert([...iv.keys()].join(','), '0,1,2');
assert([...iv.values()].join(','), 'a,b,c');
assert([...iv.entries()].join(','), '0,a,1,b,2,c');
assert(iv.has('e'), false);
assert(iv.add('d').has('d'), true);

assert(s2.has('b'), true);
assert(s2.has('c'), false);
assert(s2.add('c'), s2);
assert(s2.has('c'), true);

assert(iv.has('e'), false);
s2.add('e');
assert(iv.has('e'), true);
assert([...iv].join(','), 'a,b,c,d,e');
assert([...s1].join(','), '0,2');
assert([...s1.values()].join(','), 'a,c');
assert([...s2.values()].join(','), 'b,c,e');
assert([...s3.values()].join(','), 'a,b');
assert(s2.delete('c'), true);
assert(s2.delete('c'), false);
assert([...iv].join(','), 'a,b,c,d,e');
assert([...s2.values()].join(','), 'b,e');
assert([...s2].join(','), '1,4');

assert(JSON.stringify(iv), '["a","b","c","d","e"]');
assert(JSON.stringify(s2), '[1,4]');

try {
  assert(iv.delete('a'), null, 'delete is not allowed');
}
catch (ok) {}

try {
  assert(iv.clear(), true, 'delete is not allowed');
}
catch (ok) {}

assert([...m1].join(','), 'a,letter a,b,letter b');
assert(m1.has('a'), true);
assert(m1.has('c'), false);
assert(m1.get('a'), 'letter a');
assert(m1.delete('a'), true);
assert(m1.delete('a'), false);
assert(m1.get('a'), void 0);
assert(m1.get('f'), void 0);
assert(iv.has('f'), false);
assert(m1.set('f', 'letter f').has('f'), true);
assert(iv.has('f'), true);
assert([...m1].join(','), 'b,letter b,f,letter f');
assert([...m1.keys()].join(','), 'a,b,c,d,e,f');
assert(JSON.stringify(m1), '[[1,"letter b"],[5,"letter f"]]');
assert(JSON.stringify(iv.mapEntries(m1.toJSON())), '[[1,"letter b"],[5,"letter f"]]');
