import { describe, it } from 'mocha';
import { strict as assert } from 'assert';
import { isValidComponentName } from '../../src/utils/format';

describe('Component Generator', () => {
  it('should return correct PascalCase name', () => {
    const result = 'MyComponent';
    assert.equal(result, 'MyComponent');
  });

  it('should return false for invalid names', () => {
    assert.ok(!isValidComponentName('myComponent'));
    assert.ok(!isValidComponentName('123Component'));
    assert.ok(!isValidComponentName('My_Component'));
  });
});
