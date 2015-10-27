import Ember from 'ember';
import { module, test } from 'qunit';
import LazyArrayWithPlaceholder from 'ember-table/models/lazy-array-with-placeholder';

module('Unit | Model | lazy array with placeholder', {});

let placeholder = new Object();

test('init with placeholder', (assert) => {
  let arr = LazyArrayWithPlaceholder.create({placeholder});
  assert.equal(arr.objectAt(0), placeholder, 'first object should be placeholder when init.');
  assert.equal(arr.get('length'), 1, 'length should be 1 when init.');
});

test('objectAt trigger load', (assert) => {
  assert.expect(1);
  let load = function (chunkIndex) {
    assert.equal(chunkIndex, 0, 'chunk index should be 0.');
    return new Promise((resolve) => resolve(['a', 'b']));
  };
  let arr = LazyArrayWithPlaceholder.create({placeholder, load});
  arr.objectAt(0);
});

test('chunkDidLoad is triggered when chunk is loaded', (assert) => {
  let arr;
  let done = assert.async();
  assert.expect(3);

  let load = function (chunkIndex) {
    assert.equal(chunkIndex, 0, 'chunk index should be 0.');
    return new Promise((resolve) => resolve(['a', 'b']));
  };
  let chunkDidLoad = () => {
    assert.ok(true, 'chunkDidLoad is triggered');
    assert.equal(arr.objectAt(0), 'a', 'should be a after data loaded');
    done();
  };

  arr = LazyArrayWithPlaceholder.create({placeholder, load, chunkDidLoad});
  arr.objectAt(0);
});

test('isCompeted', (assert) => {
  let arr;
  let done = assert.async();
  assert.expect(2);

  let load = function () {
    return new Promise((resolve) => resolve(['a', 'b']));
  };
  let chunkDidLoad = () => {
    assert.ok(arr.get('length'), 'should be 2');
    assert.ok(arr.get('isCompleted'), 'should be completed');
    done();
  };

  arr = LazyArrayWithPlaceholder.create({placeholder, load, chunkDidLoad, totalCount: 2, chunkSize: 2});
  arr.objectAt(0);
});

test('itemClass', (assert) => {
  let itemClass = Ember.Object.extend({isItem: true});
  let arr;
  let done = assert.async();
  let load = function () {
    return new Promise((resolve) => resolve([{name: 'Test'}]));
  };
  let chunkDidLoad = () => {
    assert.ok(arr.objectAt(0).get('isItem'));
    done();
  };

  arr = LazyArrayWithPlaceholder.create({placeholder, load, chunkDidLoad, totalCount: 2, itemClass});
  arr.objectAt(0);
});

