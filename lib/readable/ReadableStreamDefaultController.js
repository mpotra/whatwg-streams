// Import symbols
const {queue, CancelSteps, PullSteps,
  cancelAlgorithm, closeRequested, controlledReadableStream} = require('../symbols');
// Import Queue functions
const {ResetQueue, DequeueValue} = require('../queue');
// Import abstract operations
const {
  IsReadableStreamDefaultController,
  ReadableStreamAddReadRequest,
  ReadableStreamClose,
  ReadableStreamCreateReadResult,
  ReadableStreamDefaultControllerCallPullIfNeeded,
  ReadableStreamDefaultControllerCanCloseOrEnqueue,
  ReadableStreamDefaultControllerClearAlgorithms,
  ReadableStreamDefaultControllerClose,
  ReadableStreamDefaultControllerEnqueue,
  ReadableStreamDefaultControllerError,
  ReadableStreamDefaultControllerGetDesiredSize
} = require('./functions');

class ReadableStreamDefaultController {
  constructor() {
    throw new TypeError('Cannot call constructor on ReadableStreamDefaultController');
  }

  get desiredSize() {
    if (false == IsReadableStreamDefaultController(this)) {
      throw new TypeError('Not a ReadableStreamDefaultController');
    }

    return ReadableStreamDefaultControllerGetDesiredSize(this);
  }

  close() {
    if (false == IsReadableStreamDefaultController(this)) {
      throw new TypeError('Not a ReadableStreamDefaultController');
    }

    if (false == ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
      throw new TypeError('Cannot close controller');
    }

    ReadableStreamDefaultControllerClose(this);
  }

  enqueue(chunk) {
    if (false == IsReadableStreamDefaultController(this)) {
      throw new TypeError('Not a ReadableStreamDefaultController');
    }

    if (false == ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
      throw new TypeError('Cannot enqueue on controller');
    }

    ReadableStreamDefaultControllerEnqueue(this, chunk);
  }

  error(e) {
    if (false == IsReadableStreamDefaultController(this)) {
      throw new TypeError('Not a ReadableStreamDefaultController');
    }

    ReadableStreamDefaultControllerError(this, e);
  }

  [CancelSteps](reason) {
    ResetQueue(this);
    const result = this[cancelAlgorithm](reason);
    ReadableStreamDefaultControllerClearAlgorithms(this);
    return result;
  }

  [PullSteps](forAuthorCode) {
    const stream = this[controlledReadableStream];
    if (this[queue].length > 0) {
      const chunk = DequeueValue(this);
      if (this[closeRequested] === true && this[queue].length <= 0) {
        ReadableStreamDefaultControllerClearAlgorithms(this);
        ReadableStreamClose(stream);
      } else {
        ReadableStreamDefaultControllerCallPullIfNeeded(this);
      }
      return Promise.resolve(ReadableStreamCreateReadResult(chunk, false, forAuthorCode));
    }

    const pendingPromise = ReadableStreamAddReadRequest(stream, forAuthorCode);
    ReadableStreamDefaultControllerCallPullIfNeeded(this);
    return pendingPromise;
  }
}

module.exports = ReadableStreamDefaultController;
