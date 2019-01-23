console.warn('NOT_IMPLEMENTED: ReadableStream.prototype.tee');
console.warn('NOT_IMPLEMENTED: ReadableStream.prototype.pipeTo');
console.warn('NOT_IMPLEMENTED: ReadableStream.prototype.pipeThrough');

const {
  InitializeReadableStream,
  IsReadableStream,
  IsReadableStreamLocked,
  ReadableStreamCancel
} = require('./functions');
const {
  MakeSizeAlgorithmFromSizeFunction,
  ValidateAndNormalizeHighWaterMark
} = require('../helpers');
const {
  AcquireReadableStreamDefaultReader,
  AcquireReadableStreamBYOBReader,
  SetUpReadableStreamDefaultControllerFromUnderlyingSource,
  SetUpReadableByteStreamControllerFromUnderlyingSource
} = require('./stream_functions');

class ReadableStream {
  constructor(underlyingSource = {}, strategy = {}) {
    InitializeReadableStream(this);

    const size = strategy['size'];
    let highWaterMark = strategy['highWaterMark'];
    const type = underlyingSource['type'];
    const typeString = String(type);

    if (typeString === 'bytes') {
      if (typeof size !== 'undefined') {
        throw new RangeError('Invalid size strategy property for byte stream controller');
      }

      if (typeof highWaterMark === 'undefined') {
        highWaterMark = 0;
      }

      highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);

      SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
    } else if (typeof type === 'undefined') {
      const sizeAlgorithm = MakeSizeAlgorithmFromSizeFunction(size);

      if (typeof highWaterMark === 'undefined') {
        highWaterMark = 1;
      }

      highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);

      SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
    } else {
      throw new RangeError('Invalid underlying source type');
    }
  }

  get locked() {
    if (false === IsReadableStream(this)) {
      throw new TypeError('Not a ReadableStream');
    }

    return IsReadableStreamLocked(this);
  }

  cancel(reason) {
    if (IsReadableStream(this) == false) {
      return Promise.reject(new TypeError('Instance is not a ReadableStream'));
    }

    if (IsReadableStreamLocked(this) == true) {
      return Promise.reject(new TypeError('ReadableStream is locked'));
    }

    return ReadableStreamCancel(this, reason);
  }

  getReader({mode} = {}) {
    if (false === IsReadableStream(this)) {
      throw new TypeError('Not a ReadableStream');
    }

    if (typeof mode === 'undefined') {
      return AcquireReadableStreamDefaultReader(this);
    }

    mode = String(mode);

    if (mode === 'byob') {
      return AcquireReadableStreamBYOBReader(this);
    }

    throw new RangeError('Invalid reader mode');
  }

  pipeThrough({writable, readable} = {}, {preventClose, preventAbort, preventCancel, signal} = {}) {
    // TODO
    throw new TypeError('Not implemented');
  }

  pipeTo(dest, {preventClose, preventAbort, preventCancel, signal} = {}) {
    // TODO
    throw new TypeError('Not implemented');
  }

  tee() {
    // TODO
    throw new TypeError('Not implemented');
  }
}

module.exports = ReadableStream;
