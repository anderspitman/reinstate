class ObjectNode {
  constructor(obj) {

    this._updateListeners = {};

    for (const name in obj) {
      this[name] = fromObject(obj[name]);
    }
  }

  onUpdate(key, callback) {
    if (this._updateListeners[key] === undefined) {
      this._updateListeners[key] = [];
    }

    this._updateListeners[key].push(callback);
  }

  notify(key) {

    if (this._updateListeners[key]) {
      for (const callback of this._updateListeners[key]) {
        callback(this[key]);
      }
    }
  }
}


class ArrayNode {
  constructor(value) {

    this._pushCallbacks = [];
    this._insertCallbacks = [];
    this._removeCallbacks = [];

    const values = [];

    for (const elem of value) {
      const child = fromObject(elem);
      values.push(child);
    }

    this._value = values;
  }

  push(elem) {
    const reinElem = fromObject(elem);
    this._value.push(reinElem);

    for (const callback of this._pushCallbacks) {
      callback(reinElem, this._value.length - 1);
    }
  }

  insert(index, elem) {
    const reinElem = fromObject(elem);
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


function fromObject(obj) {

  if (obj instanceof Array) {
    return new ArrayNode(obj);
  }
  else if (typeof obj === 'object') {

    const reinObj = new ObjectNode(obj);
    return new Proxy(reinObj, {

      set: function(target, prop, value) {

        if (target[prop] !== value) {
          target[prop] = fromObject(value);

          reinObj.notify(prop);
        }

        return true;
      },
    });
  }
  else {
    return obj;
  }
}

function onUpdated(obj, key, callback) {
  if (obj[key] !== undefined) {
    if (obj.onUpdate) {
      obj.onUpdate(key, callback);
    }
  }
  else {
    throw new Error("reinstate.onUpdated: object does not have key " + key);
  }
}

export default { fromObject, onUpdated };
