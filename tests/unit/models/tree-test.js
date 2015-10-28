import Ember from 'ember';
import { module, test } from 'qunit';
import LazyArrayWithPlaceholder from 'ember-table/models/lazy-array-with-placeholder';
import Tree from 'ember-table/models/tree';

let chunkSize = 5,

  load = function (chunkIndex) {
    let defer = Ember.RSVP.defer();
    var result = Ember.ArrayProxy.create({
      content: [1, 2, 3, 4, 5].map((i) => {
        return {id: i + chunkIndex * chunkSize, length: i};
      }),
      meta: {
        totalCount: 100,
        chunkSize
      }
    });
    defer.resolve(result);
    return defer.promise;
  };

module('Unit | Model | Tree', {});

let meta = {
  placeholder: Ember.Object.create(),
  load
};

test('init length', (assert) => {
  let root = Tree.create({meta});
  assert.equal(root.get('length'), 1, 'should init length to be 1');
});

test('init length with children', (assert) => {
  let done = assert.async();
  let root = Tree.create({meta});
  root.set('isExpanded', true);
  assert.equal(root.get('length'), 2, 'should init length to be 2');
  root.set('children.chunkDidLoad', () => {
    assert.equal(root.get('length'), 7, 'should init length to be 7');
    done();
  });
  assert.equal(root.objectAt(1), meta.placeholder);
});

