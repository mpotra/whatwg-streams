const assert = require('./assert');
const {FakeDetached, PromiseIsHandled} = require('./symbols');

function CreateAlgorithmFromUnderlyingMethod(underlyingObject, methodName, algoArgCount, extraArgs) {
  assert(typeof underlyingObject !== 'undefined', 'underlyingObject must not be undefined');
  assert(IsPropertyKey(methodName) === true, 'Invalid method name');
  assert(algoArgCount === 0 || algoArgCount === 1);

  const method = underlyingObject[methodName];
  let algo;

  if (typeof method !== 'undefined') {
    if (typeof method !== 'function') {
      throw new TypeError('Method not a function');
    }

    if (algoArgCount === 0) {
      algo = () => PromiseCall(method, underlyingObject, extraArgs);
      return algo;
    } else {
      algo = (arg) => {
        const fullArgs = [arg].concat(extraArgs);
        return PromiseCall(method, underlyingObject, fullArgs);
      };
      return algo;
    }
  }

  algo = () => Promise.resolve(undefined);
  return algo;
}

function InvokeOrNoop(O, P, args) {
  assert(typeof O !== 'undefined', 'Object must not be undefined');
  assert(IsPropertyKey(P) == true, 'Invalid property key');
 
  const method = O[P];

  if (typeof method === 'undefined') {
    return undefined;
  }

  if (args.length === 0) {
    return method.call(O);
  } else if (args.length === 1) {
    return method.call(O, args[0]);
  } else if (args.length === 2) {
    return method.call(O, args[0], args[1]);
  } else {
    return method.apply(O, args);
  }
}

function IsPropertyKey(key) {
  const type = (typeof key);
  return (type === 'string' || type === 'symbol');
}

function PromiseCall(F, V, args) {
  assert(typeof F === 'function', 'Function is callable');
  assert(typeof V !== 'undefined', 'V is not undefined');

  let returnValue;
  try {
    returnValue = F.apply(V, args);
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve(returnValue);
}

function IsFiniteNonNegativeNumber(v) {
  if (IsNonNegativeNumber(v) == false) {
    return false;
  }

  if (v == Number.POSITIVE_INFINITY) {
    return false;
  }

  return true;
}

function IsNonNegativeNumber(v) {
  if (typeof v !== 'number') {
    return false;
  }

  if (Number.isNaN(v)) {
    return false;
  }

  if (v < 0) {
    return false;
  }

  return true;
}

function ValidateAndNormalizeHighWaterMark(highWaterMark) {
  highWaterMark = Number(highWaterMark);

  if (Number.isNaN(highWaterMark) || highWaterMark < 0) {
    throw new RangeError('Invalid highWaterMark value');
  }

  return highWaterMark;
}

function MakeSizeAlgorithmFromSizeFunction(size) {
  if (typeof size === 'undefined') {
    return () => 1;
  }

  if (IsCallable(size) === false) {
    throw new TypeError('Invalid non-callable size argument');
  }

  return (chunk) => size(chunk);
}

function IsCallable(arg) {
  if (typeof arg === 'function') {
    return true;
  }

  return false;
}

function HasInternalSlot(object, slot) {
  return Object.prototype.hasOwnProperty.call(object, slot);
}

function IsDetachedBuffer(buffer) {
  return (HasInternalSlot(buffer, FakeDetached) && buffer[FakeDetached] === true);
}

function SetPromiseIsHandled(promise, bool) {
  if (bool === true) {
    promise[PromiseIsHandled] = true;
    promise.catch(noop);
  }
}

function noop() {
}

module.exports = {
  CreateAlgorithmFromUnderlyingMethod,
  InvokeOrNoop,
  IsPropertyKey,
  PromiseCall,
  HasInternalSlot,
  IsDetachedBuffer,
  IsFiniteNonNegativeNumber,
  IsNonNegativeNumber,
  ValidateAndNormalizeHighWaterMark,
  MakeSizeAlgorithmFromSizeFunction,
  SetPromiseIsHandled
};
