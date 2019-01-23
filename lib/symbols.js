/**
 * ReadableStream internal properties.
 */
const disturbed = Symbol('[[disturbed]]');
const readableStreamController = Symbol('[[readableStreamController]]');
const reader = Symbol('[[reader]]');
const state = Symbol('[[state]]');
const storedError = Symbol('[[storedError]]');

/**
 * Common Controller internal properties.
 */
const cancelAlgorithm = Symbol('[[cancelAlgorithm]]');
const closeRequested = Symbol('[[closeRequested]]');
const pullAgain = Symbol('[[pullAgain]]');
const pullAlgorithm = Symbol('[[pullAlgorithm]]');
const pulling = Symbol('[[pulling]]');
const started = Symbol('[[started]]');
const strategyHWM = Symbol('[[strategyHWM]]');
const CancelSteps = Symbol('[[CancelSteps]]');
const PullSteps = Symbol('[[PullSteps]]');

/**
 * ReadableStreamDefaultController internal properties.
 */
const controlledReadableStream = Symbol('[[controlledReadableStream]]');
const strategy = Symbol('[[strategy]]');
const strategySizeAlgorithm = Symbol('[[strategySizeAlgorithm]]');

/**
 * ReadableByteStreamController internal properties.
 */
const autoAllocateChunkSize = Symbol('[[autoAllocateChunkSize]]');
const byobRequest = Symbol('[[byobRequest]]');
const controlledReadableByteStream = Symbol('[[controlledReadableByteStream]]');
const pendingPullIntos = Symbol('[[pendingPullIntos]]');


/**
 * Container internal properties.
 */
const queue = Symbol('[[queue]]');
const queueTotalSize = Symbol('[[queueTotalSize]]');

/**
 * Reader symbols
 */
const closedPromise = Symbol('[[closedPromise]]');
const ownerReadableStream = Symbol('[[ownerReadableStream]]');
const readRequests = Symbol('[[readRequests]]');
const readIntoRequests = Symbol('[[readIntoRequests]]');

/**
 * Promises
 */
const PromiseIsHandled = Symbol('[[PromiseIsHandled]]');

/**
 * Other (utils)
 */
const FakeDetached = Symbol('[[FakeDetached]]');

module.exports = {
  // ReadableStream
  readableStreamController, reader, state, storedError, disturbed,
  // ReadableStreamDefaultController
  cancelAlgorithm, closeRequested, controlledReadableStream, controlledReadableByteStream, pullAgain, pullAlgorithm,
  pulling, started, strategy, strategyHWM, strategySizeAlgorithm, CancelSteps, PullSteps,
  // Container
  queue, queueTotalSize,
  // Reader
  closedPromise, ownerReadableStream, readRequests, readIntoRequests,
  // Promises
  PromiseIsHandled,
  // Other
  FakeDetached
};
