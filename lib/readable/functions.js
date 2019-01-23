/**
 * Abstract operations used in ReadableStream, ReadableStreamDefaultReader, ReadableStreamDefaultController,
 * ReadableStreamBYOBReader and ReadableByteStreamController interfaces.
 *
 * Note: Functions are defined in alphabetical name order.
 */
console.warn('NOT_IMPLEMENTED: ReadableByteStreamControllerPullInto');
console.warn('NOT_IMPLEMENTED: SetUpReadableByteStreamController');
 
const assert = require('../assert');
const {
  state, reader, storedError, disturbed, readableStreamController,
  readRequests, readIntoRequests, closedPromise, ownerReadableStream,
  controlledReadableStream, CancelSteps, PullSteps, pulling, pullAgain, pullAlgorithm, started,
  cancelAlgorithm, strategySizeAlgorithm, strategyHWM, queue, queueTotalSize, closeRequested
} = require('../symbols');
const {HasInternalSlot, SetPromiseIsHandled} = require('../helpers');
const {CreatePromise, PromiseResolve: Resolve, PromiseReject: Reject} = require('../promises');
const {ResetQueue, EnqueueValueWithSize} = require('../queue');

function InitializeReadableStream(stream) {
  stream[state] = 'readable';
  stream[reader] = undefined;
  stream[storedError] = undefined;
  stream[disturbed] = false;
}

function IsReadableStream(stream) {
  if (typeof stream !== 'object' || stream == null) {
    return false;
  }

  return HasInternalSlot(stream, readableStreamController);
}

function IsReadableStreamBYOBReader(x) {
  if (typeof x !== 'object') {
    return false;
  }

  return HasInternalSlot(x, readIntoRequests);
}

function IsReadableStreamDefaultController(x) {
  if (typeof x !== 'object') {
    return false;
  }

  return HasInternalSlot(x, controlledReadableStream);
}

function IsReadableStreamDefaultReader(x) {
  if (typeof x !== 'object') {
    return false;
  }

  return HasInternalSlot(x, readRequests);
}

function IsReadableStreamDisturbed(stream) {
  assert(IsReadableStream(stream) == true);
  return stream[disturbed];
}

function IsReadableStreamLocked(stream) {
  assert(IsReadableStream(stream) === true);
  if (typeof stream[reader] === 'undefined') {
    return false;
  }
  return true;
}

function ReadableByteStreamControllerPullInto(controller, view, forAuthorCode) {
  throw new TypeError('NOT_IMPLEMETED: ReadableByteStreamControllerPullInto not implemented');
}

function ReadableStreamAddReadRequest(stream, forAuthorCode) {
  assert(IsReadableStreamDefaultReader(stream[reader]) === true);
  assert(stream[state] === 'readable');
  const promise = CreatePromise();
  const readRequest = {
    promise,
    forAuthorCode
  };
  stream[reader][readRequests].push(readRequest);
  return promise;
}

function ReadableStreamBYOBReaderRead(_reader, view, forAuthorCode) {
  if (arguments.length < 3) {
    forAuthorCode = false;
  }

  const stream = _reader[ownerReadableStream];
  assert(typeof stream !== 'undefined');
  stream[disturbed] = true;
  if (stream[state] === 'errored') {
    return Promise.reject(stream[storedError]);
  }

  return ReadableByteStreamControllerPullInto(stream[readableStreamController], view, forAuthorCode);
}

function ReadableStreamCancel(stream, reason) {
  stream[disturbed] = true;

  if (stream[state] === 'closed') {
    return Promise.resolve(undefined);
  }

  if (stream[state] === 'errored') {
    return Promise.reject(stream[storedError]);
  }

  ReadableStreamClose(stream);

  const sourceCancelPromise = stream[readableStreamController][CancelSteps](reason);
  const returnValue = Promise.resolve(undefined);
  const fulfillmentHandler = () => returnValue;

  return sourceCancelPromise.then(fulfillmentHandler);
}

function ReadableStreamClose(stream) {
  assert(stream[state] === 'readable');
  stream[state] = 'closed';

  const _reader = stream[reader];
  if (typeof _reader === 'undefined') {
    return;
  }

  if (IsReadableStreamDefaultReader(_reader) == true) {
    _reader[readRequests].forEach((readRequest) => {
      Resolve(readRequest['promise'], ReadableStreamCreateReadResult(undefined, true, readRequest['forAuthorCode']));
    });
    _reader[readRequests] = [];
  }

  Resolve(_reader[closedPromise], undefined);
}

function ReadableStreamCreateReadResult(value, done, forAuthorCode) {
  const proto = (forAuthorCode ? Object.prototype : null);
  assert(typeof done === 'boolean');
  const obj = Object.create(proto);
  obj['value'] = value;
  obj['done'] = done;
  return obj;
}

function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
  const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
  if (false == shouldPull) {
    return;
  }

  if (controller[pulling] == true) {
    controller[pullAgain] = true;
    return;
  }

  assert(controller[pullAgain] === false);

  controller[pulling] = true;

  const pullPromise = controller[pullAlgorithm]();

  pullPromise.then(
    () => {
      controller[pulling] = false;
      if (controller[pullAgain] == true) {
        controller[pullAgain] = false;
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
      }
    },
    (e) => {
      console.log('ERROR:', e);
      ReadableStreamDefaultControllerError(controller, e);
    }
  );
}

function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
  const _state = controller[controlledReadableStream][state];
  if (controller[closeRequested] == false && _state == 'readable') {
    return true;
  }
  return false;
}

function ReadableStreamDefaultControllerClearAlgorithms(controller) {
  controller[pullAlgorithm] = undefined;
  controller[cancelAlgorithm] = undefined;
  controller[strategySizeAlgorithm] = undefined;
}

function ReadableStreamDefaultControllerClose(controller) {
  const stream = controller[controlledReadableStream];
  assert(ReadableStreamDefaultControllerCanCloseOrEnqueue(controller));
  controller[closeRequested] = true;

  if (controller[queue].length <= 0) {
    ReadableStreamDefaultControllerClearAlgorithms(controller);
    ReadableStreamClose(stream);
  }
}

function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
  const stream = controller[controlledReadableStream];
  assert(ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) == true);

  if (IsReadableStreamLocked(stream) == true && ReadableStreamGetNumReadRequests(stream) > 0) {
    ReadableStreamFulfillReadRequest(stream, chunk, false);
  } else {
    let chunkSize;

    try {
      chunkSize = controller[strategySizeAlgorithm](chunk);
    } catch (e) {
      ReadableStreamDefaultControllerError(controller, e);
      throw e;
    }

    try {
      EnqueueValueWithSize(controller, chunk, chunkSize);
    } catch (e) {
      ReadableStreamDefaultControllerError(controller, e);
      throw e;
    }
  }

  ReadableStreamDefaultControllerCallPullIfNeeded(controller);
}

function ReadableStreamDefaultControllerError(controller, e) {
  const stream = controller[controlledReadableStream];

  if (stream[state] !== 'readable') {
    return;
  }

  ResetQueue(controller);
  ReadableStreamDefaultControllerClearAlgorithms(controller);
  ReadableStreamError(stream, e);
}

function ReadableStreamDefaultControllerGetDesiredSize(controller) {
  const stream = controller[controlledReadableStream];
  const _state = stream[state];

  if (_state === 'errored') {
    return null;
  }

  if (_state === 'closed') {
    return 0;
  }

  return (controller[strategyHWM] - controller[queueTotalSize]);
}

function ReadableStreamDefaultControllerShouldCallPull(controller) {
  const stream = controller[controlledReadableStream];
  if (false == ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
    return false;
  }

  if (controller[started] == false) {
    return false;
  }

  if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
    return true;
  }

  const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
  assert(desiredSize !== null);

  return (desiredSize > 0);
}

function ReadableStreamDefaultReaderRead(_reader, forAuthorCode) {
  if (arguments.length < 2) {
    forAuthorCode = false;
  }

  const stream = _reader[ownerReadableStream];
  assert(typeof stream !== 'undefined');
  stream[disturbed] = true;

  if (stream[state] === 'closed') {
    return Promise.resolve(ReadableStreamCreateReadResult(undefined, true, forAuthorCode));
  }

  if (stream[state] === 'errored') {
    return Promise.reject(stream[storedError]);
  }

  assert(stream[state] === 'readable');

  return stream[readableStreamController][PullSteps](forAuthorCode);
}

function ReadableStreamError(stream, e) {
  assert(IsReadableStream(stream) === true);
  assert(stream[state] === 'readable');

  stream[state] = 'errored';
  stream[storedError] = e;

  const _reader = stream[reader];

  if (typeof _reader === 'undefined') {
    return;
  }

  if (IsReadableStreamDefaultReader(_reader) === true) {
    _reader[readRequests].forEach((readRequest) => {
      Reject(readRequest['promise'], e);
    });
    _reader[readRequests] = [];
  } else {
    assert(IsReadableStreamBYOBReader(_reader));
    _reader[readIntoRequests].forEach((readIntoRequest) => {
      Reject(readIntoRequest['promise'], e);
    });
    _reader[readIntoRequests] = [];
  }

  Reject(_reader[closedPromise], e);
  SetPromiseIsHandled(_reader[closedPromise], true);
}

function ReadableStreamFulfillReadRequest(stream, chunk, done) {
  const _reader = stream[reader];
  const readRequest = _reader[readRequests].shift();
  Resolve(readRequest['promise'], ReadableStreamCreateReadResult(chunk, done, readRequest['forAuthorCode']));
}

function ReadableStreamGetNumReadRequests(stream) {
  return stream[reader][readRequests].length;
}

function ReadableStreamReaderGenericInitialize(_reader, stream) {
  _reader[ownerReadableStream] = stream;
  stream[reader] = _reader;
  if (stream[state] === 'readable') {
    _reader[closedPromise] = CreatePromise();
  } else if (stream[state] === 'closed') {
    _reader[closedPromise] = Promise.resolve(undefined);
  } else {
    assert(stream[state] === 'errored');
    _reader[closedPromise] = Promise.reject(stream[storedError]);
    SetPromiseIsHandled(_reader[closedPromise], true);
  }
}

function ReadableStreamReaderGenericCancel(_reader, reason) {
  const stream = _reader[ownerReadableStream];
  assert(typeof stream !== 'undefined');
  return ReadableStreamCancel(stream, reason);
}

function ReadableStreamReaderGenericRelease(_reader) {
  assert(typeof _reader[ownerReadableStream] !== 'undefined');
  assert(_reader[ownerReadableStream][reader] === _reader);
  if (_reader[ownerReadableStream][state] === 'readable') {
    Reject(_reader[closedPromise], new TypeError('Reader released'));
  } else {
    _reader[closedPromise] = Promise.reject(new TypeError('Reader released'));
  }
  SetPromiseIsHandled(_reader[closedPromise], true);
  _reader[ownerReadableStream][reader] = undefined;
  _reader[ownerReadableStream] = undefined;
}

function SetUpReadableByteStreamController(stream, controller, _startAlgorithm, _pullAlgorithm, _cancelAlgorithm,
  highWaterMark, autoAllocateChunkSize) {

  throw new TypeError('NOT_IMPLEMENTED: SetUpReadableByteStreamController not implemented.');
}

function SetUpReadableStreamDefaultController(stream, controller, _startAlgorithm, _pullAlgorithm, _cancelAlgorithm,
  highWaterMark, _sizeAlgorithm) {

  assert(typeof stream[readableStreamController] === 'undefined');

  controller[controlledReadableStream] = stream;
  controller[queue] = undefined;
  controller[queueTotalSize] = undefined;
  ResetQueue(controller);

  controller[started] = false;
  controller[closeRequested] = false;
  controller[pullAgain] = false;
  controller[pulling] = false;

  controller[strategySizeAlgorithm] = _sizeAlgorithm;
  controller[strategyHWM] = highWaterMark;
  controller[pullAlgorithm] = _pullAlgorithm;
  controller[cancelAlgorithm] = _cancelAlgorithm;

  stream[readableStreamController] = controller;

  const startResult = _startAlgorithm();
  const startPromise = Promise.resolve(startResult);

  startPromise.then(
    () => {
      controller[started] = true;
      assert(controller[pulling] === false);
      assert(controller[pullAgain] === false);
      ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    },
    (reason) => {
      ReadableStreamDefaultControllerError(controller, reason);
    }
  );
}

module.exports = {
  InitializeReadableStream,
  IsReadableStream,
  IsReadableStreamBYOBReader,
  IsReadableStreamDefaultController,
  IsReadableStreamDefaultReader,
  IsReadableStreamDisturbed,
  IsReadableStreamLocked,
  ReadableStreamAddReadRequest,
  ReadableStreamBYOBReaderRead,
  ReadableStreamCancel,
  ReadableStreamClose,
  ReadableStreamCreateReadResult,
  ReadableStreamDefaultControllerCallPullIfNeeded,
  ReadableStreamDefaultControllerCanCloseOrEnqueue,
  ReadableStreamDefaultControllerClearAlgorithms,
  ReadableStreamDefaultControllerClose,
  ReadableStreamDefaultControllerEnqueue,
  ReadableStreamDefaultControllerError,
  ReadableStreamDefaultControllerGetDesiredSize,
  ReadableStreamDefaultControllerShouldCallPull,
  ReadableStreamDefaultReaderRead,
  ReadableStreamError,
  ReadableStreamFulfillReadRequest,
  ReadableStreamGetNumReadRequests,
  ReadableStreamReaderGenericInitialize,
  ReadableStreamReaderGenericCancel,
  ReadableStreamReaderGenericRelease,
  SetUpReadableByteStreamController,
  SetUpReadableStreamDefaultController
};
