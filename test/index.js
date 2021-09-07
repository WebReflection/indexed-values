const {IndexedValues} = require('../cjs');

const assert = (a, b) => {
  console.assert(a === b, `expected ${a}, got ${b} instead`);
  if (a !== b)
    process.exit(1);
};

const chars = ['a', 'b', 'c'];
const main = new Set(chars);

const MainArray = IndexedValues(main);

const a = MainArray.from([chars[0], chars[2]]);
const b = MainArray.from([chars[1]]);

assert(JSON.stringify(a), '[0,2]');
assert(JSON.stringify(b), '[1]');

const parsed_a = JSON.parse(JSON.stringify(a));
const parsed_b = JSON.parse(JSON.stringify(b));

assert(parsed_a.join(','), '0,2');
assert(parsed_b.join(','), '1');

assert(JSON.stringify(parsed_a), '[0,2]');
assert(JSON.stringify(parsed_b), '[1]');

const aa = MainArray.fromJSON(parsed_a);
const bb = MainArray.fromJSON(parsed_b);

assert(aa.join(','), [chars[0], chars[2]].join(','));
assert(bb.join(','), [chars[1]].join(','));

assert(JSON.stringify(aa), '[0,2]');
assert(JSON.stringify(bb), '[1]');
