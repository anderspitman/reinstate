class Node {
  constructor() {
    this._updateListeners = [];
  }

  get() {
    return this._value;
  }

  set(value) {

    this._value = value;

    // TODO: only notify if value is different
    for (const listener of this._updateListeners) {
      listener(value);
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
    console.log(this._value);

    for (const callback of this._pushCallbacks) {
      callback(reinElem);
    }
  }

  map(func) {
    return this._value.map(func);
  }

  onPush(callback) {
    this._pushCallbacks.push(callback);
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
  if (obj instanceof Array) {
    return new ArrayNode(obj);
  }
  else if (typeof obj === 'number') {
    return new NumberNode(obj);
  }
  else if (typeof obj === 'boolean') {
    return new BoolNode(obj);
  }
  else if (typeof obj === 'string') {
    return new StringNode(obj);
  }
  else if (typeof obj === 'object') {
    return new ObjectNode(obj);
  }
  else {
    throw new Error("Invalid type: " + typeof obj)
  }
}

export { fromObject };
