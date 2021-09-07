const {prototype} = Array;
const {create, freeze} = Object;

export function IndexedValues(values) {
  'use strict';
  values.forEach(push, this);
  return freeze(this);
}

IndexedValues.prototype = create(prototype, {
  has: {
    value: prototype.includes || function (value) {
      return -1 < this.indexOf(value);
    }
  },
  fromIndex: {
    value(index) {
      return this[index];
    }
  },
  fromIndexes: {
    value(indexes) {
      return indexes.map(this.fromIndex, this);
    }
  },
  toIndex: {
    value(value) {
      const index = this.indexOf(value);
      return index < 0 ? void 0 : index;
    }
  },
  toIndexes: {
    value(values) {
      return values.map(this.toIndex, this);
    }
  },
  toJSON: {
    value() {
      return Array.from(this);
    }
  }
});

function push(value) {
  this.push(value);
}
