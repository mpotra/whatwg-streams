const {readRequests, closedPromise, ownerReadableStream} = require('../symbols');
const {
  IsReadableStream, IsReadableStreamDefaultReader, IsReadableStreamLocked,
  ReadableStreamDefaultReaderRead,
  ReadableStreamReaderGenericInitialize,
  ReadableStreamReaderGenericCancel,
  ReadableStreamReaderGenericRelease
} = require('./functions');

class ReadableStreamDefaultReader {
  constructor(stream) {
    if (false === IsReadableStream(stream)) {
      throw new TypeError('Invalid ReadableStream argument in constructor');
    }

    if (true === IsReadableStreamLocked(stream)) {
      throw new TypeError('ReadableStream is already locked');
    }

    ReadableStreamReaderGenericInitialize(this, stream);

    this[readRequests] = [];
  }

  get closed() {
    if (false === IsReadableStreamDefaultReader(this)) {
      return Promise.reject(new TypeError('Not a ReadableStreamDefaultReader'));
    }

    return this[closedPromise];
  }

  cancel(reason) {
    if (false === IsReadableStreamDefaultReader(this)) {
      return Promise.reject(new TypeError('Not a ReadableStreamDefaultReader'));
    }

    if (typeof this[ownerReadableStream] === 'undefined') {
      return Promise.reject(new TypeError('Reader already released from stream'));
    }

    return ReadableStreamReaderGenericCancel(this, reason);
  }

  read() {
    if (false === IsReadableStreamDefaultReader(this)) {
      return Promise.reject(new TypeError('Not a ReadableStreamDefaultReader'));
    }

    if (typeof this[ownerReadableStream] === 'undefined') {
      return Promise.reject(new TypeError('Reader already released from stream'));
    }

    return ReadableStreamDefaultReaderRead(this, true);
  }

  releaseLock() {
    if (false === IsReadableStreamDefaultReader(this)) {
      throw new TypeError('Not a ReadableStreamDefaultReader');
    }

    if (typeof this[ownerReadableStream] === 'undefined') {
      return;
    }

    if (this[readRequests].length > 0) {
      throw new TypeError('There still are pending read requests');
    }

    ReadableStreamReaderGenericRelease(this);
  }
}

module.exports = ReadableStreamDefaultReader;
