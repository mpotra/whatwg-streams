/**
 * Module that handles deferrable Promises.
 *
 * Each deferrable Promise created is mapped in a WeakMap to a controller that allows either resolving
 * or rejecting the promise.
 */
const promises = module.exports = {
  map: new WeakMap(),
  PromiseConstructor: Promise
};

/**
 * Creates a new deferrable Promise instance, and maps it to a controller.
 *
 * @param {Function} PromiseConstructor The constructor function to invoke in creating a new promise.
 * @returns {Promise} The promise created.
 */
module.exports.CreatePromise = function CreatePromise(PromiseConstructor) {
  PromiseConstructor = PromiseConstructor || promises.PromiseConstructor;

  const handle = {
    settled: false
  };

  // Create the new Promise instance.
  const promise = new PromiseConstructor((promiseResolve, promiseReject) => {
    // Define the .resolve() function.
    handle.resolve = function resolve(value) {
      if (!handle.settled) {
        settlePromise();
        promiseResolve(value);
      }
    };

    // Define the .reject() function.
    handle.reject = function reject(reason) {
      if (!handle.settled) {
        settlePromise();
        promiseReject(reason);
      }
    };
  });

  // Mark the promise as settled, and remove it from the mapping.
  function settlePromise() {
    // Set settled flag to true.
    handle.settled = true;
    // Remove the promise from the mapping.
    promises.map.delete(promise);
  }

  // Add a mapping to the controller of the promise.
  promises.map.set(promise, handle);

  return promise;
};

/**
 * Resolves a deferrable (previously mapped) Promise
 */
module.exports.PromiseResolve = function PromiseResolve(promise, value) {
  if (promises.map.has(promise)) {
    const handle = promises.map.get(promise);
    handle.resolve(value);
  } else {
    // Promise has either never been mapped, or has settled.
    throw new ReferenceError('Promise not found in mapping');
  }
};

module.exports.PromiseReject = function PromiseReject(promise, reason) {
  if (promises.map.has(promise)) {
    const handle = promises.map.get(promise);
    handle.reject(reason);
  } else {
    throw new ReferenceError('Promise not found in mapping');
  }
};
