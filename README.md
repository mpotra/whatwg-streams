# WHATWG Streams Implementation

This repository provides a stand-alone implementation in Node.js of the [WHATWG Streams Living Standard Specification](https://streams.spec.whatwg.org)

# Current Status

Current status is **WIP** _(Work In Progress)_ and implements the Standard as follows:

- [Readable streams](https://streams.spec.whatwg.org/#rs) - **partial** _(missing support for byte streams)_
    - [ReadableStream](https://streams.spec.whatwg.org/#rs-class) - **partial**
    - [ReadableStreamDefaultReader](https://streams.spec.whatwg.org/#default-reader-class) - **complete**
    - [ReadableStreamBYOBReader](https://streams.spec.whatwg.org/#byob-reader-class) - **missing (WIP)**
    - [ReadableStreamDefaultController](https://streams.spec.whatwg.org/#rs-default-controller-class) - **complete**
    - [ReadableByteStreamController](https://streams.spec.whatwg.org/#rbs-controller-class) - **missing (WIP)**
    - [ReadableStreamBYOBRequest](https://streams.spec.whatwg.org/#rs-byob-request-class) - **missing**
- [Writable streams](https://streams.spec.whatwg.org/#ws) - **missing**
    - [WritableStream](https://streams.spec.whatwg.org/#ws-class) - **missing**
    - [WritableStreamDefaultWriter](https://streams.spec.whatwg.org/#default-writer-class) - **missing**
    - [WritableStreamDefaultController](https://streams.spec.whatwg.org/#ws-default-controller-class) - **missing**
- [Transform streams](https://streams.spec.whatwg.org/#ts) - **missing**
    - [TransformStream](https://streams.spec.whatwg.org/#ts-class) - **missing**
    - [TransformStreamDefaultController](https://streams.spec.whatwg.org/#ts-default-controller-class) - **missing**
- Other API and operations - **partial**
    - [Queuing strategies](https://streams.spec.whatwg.org/#qs) - **missing**
        - [ByteLengthQueuingStrategy](https://streams.spec.whatwg.org/#blqs-class) - **missing**
        - [CountQueuingStrategy](https://streams.spec.whatwg.org/#cqs-class) - **missing**
    - [Queue-with-sizes](https://streams.spec.whatwg.org/#queue-with-sizes) - **complete**
    - [Miscellaneous operations](https://streams.spec.whatwg.org/#misc-abstract-ops) - **almost complete**
        - [TransferArrayBuffer(O)](https://streams.spec.whatwg.org/#transfer-array-buffer) - **missing**

## Installation

`npm install whatwg-streams-impl`


## Usage example (ReadableStream)

```js

const nodeReadableStream = getReadableStream(); // Get a Node.js Readable stream somehow

// Create a ReadableStream instance, based on the nodeReadableStream underlying source.
const stream = new ReadableStream({
  start(controller) {
    nodeReadableStream.pause();
    nodeReadableStream.on('data', (chunk) => {
      controller.enqueue(chunk);
      nodeReadableStream.pause();
    });
    nodeReadableStream.once('end', () => controller.close());
    nodeReadableStream.once('error', (e) => controller.error(e));
  },
  pull(controller) {
    nodeReadableStream.resume();
  },
  cancel() {
    nodeReadableStream.destroy();
  }
});

// Get a Reader for the stream.
const reader = stream.getReader();

// Start reading from the reader.
doReadEverything();

// Function that reads from the reader, consuming all data.
async function doReadEverything() {
  let value;
  let done = false;

  while (!done) {
    ({value, done} = await reader.read());

    // Do something with value, if `done` is still not `true`
  }

  // Finished reading. Do something
}
```
