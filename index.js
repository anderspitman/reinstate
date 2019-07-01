class Node {
  constructor() {
    this._updateListeners = [];
  }

  get() {
    return this._value;
  }

  set(value) {

    // TODO: should probably test this to make sure the check is valid
    if (value !== this._value) {

      this._value = value;

      for (const listener of this._updateListeners) {
        listener(value);
      }
    }
  }

  onUpdate(callback) {
    this._updateListeners.push(callback);
  }
}

class ObjectNode extends Node {
  constructor(obj) {
    super();

    for (const name in obj) {
      this[name] = fromObject(obj[name]);
    }
  }
}

class NumberNode extends Node {
  constructor(value) {
    super();
    this.set(value);
  }
}

class StringNode extends Node {
  constructor(value) {
    super();
    this.set(value);
  }
}

class BoolNode extends Node {
  constructor(value) {
    super();
    this.set(value);
  }
}

class ArrayNode extends Node {
  constructor(value) {
    super();

    this._pushCallbacks = [];
    this._insertCallbacks = [];
    this._removeCallbacks = [];

    const values = [];

    this._ItemConstructor = getConstructor(value[0]);

    for (const elem of value) {
      const child = new this._ItemConstructor(elem);
      values.push(child);
    }

    this.set(values);
  }

  push(elem) {
    const reinElem = new this._ItemConstructor(elem);
    this._value.push(reinElem);

    for (const callback of this._pushCallbacks) {
      callback(reinElem, this._value.length - 1);
    }
  }

  insert(index, elem) {
    const reinElem = new this._ItemConstructor(elem);
    this._value.splice(index, 0, reinElem);

    for (const callback of this._insertCallbacks) {
      callback(reinElem, index);
    }
  }

  remove(index) {
    this._value.splice(index, 1);

    const elem = this._value[index];

    for (const callback of this._removeCallbacks) {
      callback(index);
    }
    
    return elem;
  }

  map(func) {
    return this._value.map(func);
  }

  onPush(callback) {
    this._pushCallbacks.push(callback);
  }

  onInsert(callback) {
    this._insertCallbacks.push(callback);
  }

  onRemove(callback) {
    this._removeCallbacks.push(callback);
  }
}

function getConstructor(obj) {
  if (obj instanceof Array) {
    return ArrayNode;
  }
  else if (typeof obj === 'number') {
    return NumberNode;
  }
  else if (typeof obj === 'boolean') {
    return BoolNode;
  }
  else if (typeof obj === 'string') {
    return StringNode;
  }
  else if (typeof obj === 'object') {
    return ObjectNode;
  }
  else {
    throw new Error("Invalid type: " + typeof obj)
  }
}

function fromObject(obj) {
  const Con = getConstructor(obj);
  return new Con(obj);
}

export { fromObject };
