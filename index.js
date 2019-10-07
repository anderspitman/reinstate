class ObjectNode {
  constructor(obj) {

    Object.defineProperty(this, '_updateListeners', {
      enumerable: false,
      writable: true,
    });
      
    this._updateListeners = {};

    Object.defineProperty(this, '_addListeners', {
      enumerable: false,
      writable: true,
    });

    this._addListeners = [];

    Object.defineProperty(this, '_deleteListeners', {
      enumerable: false,
      writable: true,
    });

    this._deleteListeners = [];

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

  onAdd(callback) {
    this._addListeners.push(callback);
  }

  onDelete(callback) {
    this._deleteListeners.push(callback);
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

  get length() {
    return this._value.length;
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

  join(ch) {
    return this._value.join(ch);
  }

  concat(other) {
    return this._value.concat(other);
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
    const reinObj = new ArrayNode(obj);
    return new Proxy(reinObj, {
      get: function(target, prop) {
        // TODO: probably need to proxy here so we can handle array[elem]
        // access
        return target[prop];
      },
    });
  }
  else if (obj === null) {
    // gets me every time that typeof null === 'object'
    return obj;
  }
  else if (typeof obj === 'object') {

    const reinObj = new ObjectNode(obj);
    return new Proxy(reinObj, {

      set: function(target, prop, value) {

        if (target[prop] !== value) {

          const newObj = fromObject(value)

          if (target[prop] === undefined) {

            target[prop] = newObj;

            for (const callback of reinObj._addListeners) {
              callback(prop);
            }
          }
          else {

            target[prop] = newObj;

            reinObj.notify(prop);
          }
        }

        return true;
      },

      deleteProperty: function(target, prop) {
        if (target[prop] !== undefined) {
          delete target[prop];

          for (const callback of reinObj._deleteListeners) {
            callback(prop);
          }

          return true;
        }

        return false;
      }
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

function onAdd(obj, callback) {
  if (obj.onAdd) {
    obj.onAdd(callback);
  }
}

function onDelete(obj, callback) {
  if (obj.onDelete) {
    obj.onDelete(callback);
  }
}

function onPush(obj, callback) {
  if (obj.onPush) {
    obj.onPush(callback);
  }
}

export default { fromObject, onAdd, onUpdated, onDelete, onPush };
