const {IndexedValues, fromJSON, toJSON} = require('../cjs');
const {packCopy: pack, unpackCopy: unpack} = require('../cjs/pack');

const assert = (a, b, m = `\n \x1b[1mexpected\x1b[0m ${b}\n \x1b[1mreceived\x1b[0m ${a}`) => {
  console.assert(a === b, m);
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

let complex = {
  some: {chars},
  nested: {
    targets: [
      {chars: ['a', 'c']},
      {chars: ['b']}
    ]
  }
};

let targets = {
  main: 'some.chars',
  target: 'nested.targets.chars'
};

let t = ['nested.targets.chars'];
let packed = pack(t, complex);
let unpacked = unpack(t, packed);

assert(JSON.stringify(unpacked), JSON.stringify(complex));

const asJSON = JSON.stringify(toJSON(complex, targets));

assert(asJSON, '{"some":{"chars":["a","b","c"]},"nested":{"targets":[{"chars":[0,2]},{"chars":[1]}]}}');
assert(
  fromJSON(JSON.parse(asJSON), targets).nested.targets.map(({chars}) => `[${chars.join(',')}]`).join(','),
  '[a,c],[b]'
);

complex = {
  chars,
  targets: [
    ['a', 'c'],
    ['b']
  ]
};

targets = {
  main: 'chars',
  target: 'targets[]'
};

t = ['chars', 'targets[]'];
packed = pack(t, complex);
unpacked = unpack(t, packed);

assert(JSON.stringify(unpacked), JSON.stringify(complex));

assert(
  JSON.stringify(toJSON(complex, targets)),
  '{"chars":["a","b","c"],"targets":[[0,2],[1]]}'
);
