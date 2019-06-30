class Node {
  constructor() {
    this._updateListeners = [];
    this._emitListeners = {};
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

  emit(eventName, ...args) {
    if (this._emitListeners[eventName] !== undefined) {
      for (const listener of this._emitListeners[eventName]) {
        listener.apply(null, args);
      }
    }
  }

  onUpdate(callback) {
    this._updateListeners.push(callback);
  }

  onEmit(eventName, callback) {
    if (this._emitListeners[eventName] === undefined) {
      this._emitListeners[eventName] = [];
    }

    this._emitListeners[eventName].push(callback);
  }
}

class ObjectNode extends Node {
  constructor(obj) {
    super();

    for (const name in obj) {
      console.log(name);
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

    const values = [];

    for (const elem of value) {
      const child = fromObject(elem);
      values.push(child);
    }

    this.set(values);
  }

  push(elem) {
    this._values.push(elem);
  }

  map(func) {
    return this._value.map(func);
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
