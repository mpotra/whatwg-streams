const assert = require('../assert');
const {
  SetUpReadableByteStreamController,
  SetUpReadableStreamDefaultController
} = require('./functions');
const {
  CreateAlgorithmFromUnderlyingMethod,
  InvokeOrNoop
} = require('../helpers');

const ReadableStreamDefaultReader = require('./ReadableStreamDefaultReader');
const ReadableStreamBYOBReader = require('./ReadableStreamBYOBReader');
const ReadableStreamDefaultController = require('./ReadableStreamDefaultController');
const ReadableByteStreamController = require('./ReadableByteStreamController');

function AcquireReadableStreamDefaultReader(stream) {
  return new ReadableStreamDefaultReader(stream);
}

function AcquireReadableStreamBYOBReader(stream) {
  return new ReadableStreamBYOBReader(stream);
}

function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark
  , sizeAlgorithm) {
  assert(typeof underlyingSource !== 'undefined');

  const controller = Object.create(ReadableStreamDefaultController.prototype);

  const startAlgorithm = () => InvokeOrNoop(underlyingSource, 'start', [controller]);
  const pullAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSource, 'pull', 0, [controller]);
  const cancelAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSource, 'cancel', 1, []);

  SetUpReadableStreamDefaultController(
    stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm
  );
}

function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
  assert(typeof underlyingByteSource !== 'undefined');

  const controller = Object.create(ReadableByteStreamController.prototype);

  const startAlgorithm = () => InvokeOrNoop(underlyingByteSource, 'start', [controller]);
  const pullAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingByteSource, 'pull', 0, [controller]);
  const cancelAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingByteSource, 'cancel', 1, []);

  let autoAllocateChunkSize = underlyingByteSource['autoAllocateChunkSize'];
  if (typeof autoAllocateChunkSize !== 'undefined') {
    autoAllocateChunkSize = Number(autoAllocateChunkSize);
    if (false == Number.isInteger(autoAllocateChunkSize) || autoAllocateChunkSize <= 0) {
      throw new RangeError('Invalid autoAllocateChunkSize. Must be a positive, non-zero integer');
    }
  }

  SetUpReadableByteStreamController(
    stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize
  );
}

module.exports = {
  AcquireReadableStreamDefaultReader,
  AcquireReadableStreamBYOBReader,
  SetUpReadableStreamDefaultControllerFromUnderlyingSource,
  SetUpReadableByteStreamControllerFromUnderlyingSource
};
