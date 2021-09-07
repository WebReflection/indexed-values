'use strict';
const privates = new WeakMap;

class IndexedValues {

  static fromJSON(entries) {
    const {length} = entries;
    const self = new this;
    if (length) {
      const _ = privates.get(self);
      _.i = entries[length - 1][1] + 1;
      _.m = new Map(entries);
    }
    return self;
  }

  toJSON() {
    return [...privates.get(this).m];
  }

  constructor(values = []) {
    const m = new Map;
    const s = new Set;
    const r = new FinalizationRegistry(s.delete.bind(s));

    let i = 0;
    for (const value of values)
      m.set(value, i++);

    privates.set(this, {
      i, m, s, r,
      w: new WeakMap,
      c: ref => {
        s.delete(ref);
        r.unregister(ref);
      }
    });
  }

  get size() {
    return privates.get(this).m.size;
  }

  *[Symbol.iterator]() {
    return yield* privates.get(this).m.keys();
  }

  add(value) {
    const _ = privates.get(this);
    if (!_.m.has(value))
      _.m.set(value, _.i++);
    return this;
  }

  clear() {
    const {s, m, c} = privates.get(this);
    for (const ref of s) {
      const indexes = ref.deref();
      if (indexes)
        indexes.splice(0);
      else
        c(ref);
    }
    m.clear();
  }

  delete(value) {
    const {s, m, c} = privates.get(this);
    if (m.has(value)) {
      const index = m.get(value);
      for (const ref of s) {
        const indexes = ref.deref();
        if (indexes) {
          const i = indexes.indexOf(index);
          if (-1 < i)
            indexes.splice(i, 1);
        }
        else
          c(ref);
      }
    }
    return m.delete(value);
  }

  has(value) {
    return privates.get(this).m.has(value);
  }

  mapIndexes() {
    const map = new Map;
    for (const [value, i] of privates.get(this).m)
      map.set(i, value);
    return map;
  }

  mapValues() {
    return new Map(privates.get(this).m.entries());
  }

  fromIndex(index, map = this.mapIndexes()) {
    return map.get(index);
  }

  fromIndexes(indexes, map = this.mapIndexes()) {
    return indexes.map(map.get, map);
  }

  toIndex(value) {
    return privates.get(this).m.get(value);
  }

  toIndexes(values, connect = true) {
    const {m} = privates.get(this);
    const indexes = [];
    for (const value of values)
      indexes.push(m.get(value));
    return connect ? this.connect(indexes) : indexes;
  }

  connect(indexes) {
    const {s, r, w} = privates.get(this);
    if (!w.has(indexes)) {
      const ref = new WeakRef(indexes);
      s.add(ref);
      r.register(indexes, ref);
      w.set(indexes, ref);
    }
    return indexes;
  }

  disconnect(indexes) {
    const {c, w} = privates.get(this);
    if (w.has(indexes)) {
      c(w.get(indexes));
      w.delete(indexes);
    }
    return indexes;
  }

  pack() {
    let i = 0;
    const _ = privates.get(this);
    const {m, c, s} = _;

    const map = new Map;
    for (const [value, index] of m) {
      map.set(index, i);
      m.set(value, i++);
    }

    _.i = i;

    for (const ref of s) {
      const indexes = ref.deref();
      if (indexes) {
        for (i = 0; i < indexes.length; i++)
          indexes[i] = map.get(indexes[i]);
      }
      else
        c(ref);
    }

    return this;
  }
}
exports.IndexedValues = IndexedValues
