# indexed-values

[![build status](https://github.com/WebReflection/indexed-values/actions/workflows/node.js.yml/badge.svg)](https://github.com/WebReflection/indexed-values/actions) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/indexed-values/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/indexed-values?branch=main)

[Related Blog Post](https://webreflection.medium.com/optimizing-json-indexeddb-or-postmessage-698112860899).

### Example

```js
import {IndexedValues} from 'indexed-values';

// create a Set of unique values
const main = new IndexedValues;

// derive a set
const sub1 = main.bindValues(["a", "b", "c"]);
const sub2 = main.bindValues(["a"]);

// derived sets can make the main Set grow
if (!sub2.has("d"))
  sub2.add("d");

// {"main":["a","b","c","d"],"data":[[0,1,2],[0,3]]}
console.log(JSON.stringify({
  main,
  data: [sub1, sub2]
}));
```

## API

The `IndexedValues` constructor extends the `Set` class, but it's a facade with the following peculiarities:

  * it is not posible to `delete` a single value, or `clear` the instance. `IndexedValues` instances are ever-growing
  * `.toJSON()` method returns an array of values held internally
  * `.valueOf()` method returns a real `Set` that can resist `postMessage`, or be stored directly as `IndexedDB`
  * `.bindValues(values = [])` returns a `Set` that can contain, add, or remove, any value. Added values will be reflected in the `IndexedValues` instance that created the bound `Set`.
  * `.bindIndexes(indexes = [])` is like `.bindValues()` but uses indexes instead, to initialize the derived `Set`. This is mostly useful for revival.
  * `.mapKeys(entries = [])` returns a `Map` where *keys* are derived from the `IndexedValues`. Added keys that are not known in the `IndexedValues` source, will be automatically added as part of the `Set`. Once serialized as *JSON*, these maps will represent all keys as indexes, because indeed these maps never hold keys as values, these hold keys as indexes.
  * `.mapEntries(entries = [])` is the revival counter-part of `.mapKeys()`. It returns a *map* with keys revived from the `IndexedValues` instance.
  * `.fromIndexes(indexes)` can revive right away `Set` instances, upgrading their prototype. This is a *quick and dirty* `.bindIndexes()` equivalent, available for performance reasons.
  * `.fromEntries(entries)` can revive right away `Map` instances, upgrading their prototype. This is a *quick and dirty* `.mapEntries()` equivalent, available for performance reasons.
