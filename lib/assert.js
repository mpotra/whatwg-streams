let assert;

try {
  assert = require('better-assert');
} catch (e) {
  const __assert = require('assert');
  assert = __assert.strict || __assert;
}

module.exports = assert;
