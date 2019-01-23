const assert = require('./assert');
const {HasInternalSlot, IsFiniteNonNegativeNumber} = require('./helpers');
const {queue, queueTotalSize} = require('./symbols');

/**
 * https://streams.spec.whatwg.org/#queue-with-sizes
 */

function DequeueValue(container) {
  assert(HasInternalSlot(container, queue));
  assert(HasInternalSlot(container, queueTotalSize));
  assert(container[queue].length > 0, 'Queue is not empty');

  const pair = container[queue].shift();
  container[queueTotalSize] -= pair.size;

  if (container[queueTotalSize] < 0) {
    container[queueTotalSize] = 0;
  }

  return pair.value;
}

function EnqueueValueWithSize(container, value, size) {
  assert(HasInternalSlot(container, queue));
  assert(HasInternalSlot(container, queueTotalSize));

  size = Number(size);

  if (IsFiniteNonNegativeNumber(size) === false) {
    throw new RangeError('Invalid size');
  }

  const pair = {value, size};

  container[queue].push(pair);
  container[queueTotalSize] += size;
}

function PeekQueueValue(container) {
  assert(HasInternalSlot(container, queue));
  assert(HasInternalSlot(container, queueTotalSize));
  assert(container[queue].length > 0, 'Queue is not empty');

  const pair = container[queue][0];
  return pair.value;
}

function ResetQueue(container) {
  assert(HasInternalSlot(container, queue));
  assert(HasInternalSlot(container, queueTotalSize));
  container[queue] = [];
  container[queueTotalSize] = 0;
}

module.exports = {
  DequeueValue,
  EnqueueValueWithSize,
  PeekQueueValue,
  ResetQueue
};
