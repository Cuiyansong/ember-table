import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import GroupedRowDataProvider from '../../fixture/grouped-row-data-provider';
import DefersPromise from '../../fixture/defer-promises';
import TreeDataProvider from '../../fixture/tree-data-provider';
import Tree from 'ember-table/models/tree';

moduleForEmberTable('Unit | Components | expand to arbitrary level', function (options) {
  let defers = DefersPromise.create();
  var groupingMetadata = [{id: 'accountSection'}, {id: 'accountType'}, {id: 'accountCode'}];
  let treeData = TreeDataProvider.create({
    chunkSize: 2,
    totalCount: 2,
    defers,
    groupingMetadata
  });
  return EmberTableFixture.create({
    height: options.height,
    groupMeta: {groupingMetadata},
    content: Tree.create({
      meta: {
        load: treeData.get('load'),
        placeholder: Ember.Object.create({isLoading: true})
      }
    })
  });
});

test('expand to level 1', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(1);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(2, [0]), [
      ["as-1"],
      ["as-2"]
    ], "should expand to level 1 on init.");
  });
});

test('expand to level 2', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(2);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(6, [0]), [
      ["as-1"],
      ["at-102"],
      ["at-101"],
      ["as-2"],
      ["at-201"],
      ["at-202"]
    ], "all level 1 rows should be expanded.");
  });
});

test('expand to level 3', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(3);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(14, [0]), [
      ["as-1"],
      ["at-102"],
      ["ac-1003"],
      ["ac-1005"],
      ["at-101"],
      ["ac-1001"],
      ["ac-1002"],
      ["as-2"],
      ["at-201"],
      ["ac-2001"],
      ["ac-2002"],
      ["at-202"],
      ["ac-2001"],
      ["ac-2002"]
    ], "all level 1,2 rows should be expanded.");
  });
});

test('expand to level 3 then scroll down', function (assert) {
  var component = this.subject({height: 150});
  this.render();

  component.expandToLevel(3);
  component.scrollRows(6);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(4, [0]), [
      ["ac-1002"],
      ["as-2"],
      ["at-201"],
      ["ac-2001"]
    ], "rows should be auto expanded.");
  });
});

test('collapse to level 1', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(3);
  component.expandToLevel(1);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(2, [0]), [
      ["as-1"],
      ["as-2"]
    ], "should collapse to level 1.");
  });
});

test('collapse to level 2', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(3);
  component.expandToLevel(2);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(6, [0]), [
      ["as-1"],
      ["at-102"],
      ["at-101"],
      ["as-2"],
      ["at-201"],
      ["at-202"]
    ], "should collapse to level 2.");
  });
});

test('expand to level 3 and collapse to level 2 and expand to level 3', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(3);
  component.expandToLevel(2);
  component.expandToLevel(3);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(14, [0]), [
      ["as-1"],
      ["at-102"],
      ["ac-1003"],
      ["ac-1005"],
      ["at-101"],
      ["ac-1001"],
      ["ac-1002"],
      ["as-2"],
      ["at-201"],
      ["ac-2001"],
      ["ac-2002"],
      ["at-202"],
      ["ac-2001"],
      ["ac-2002"]
    ], "all level 1,2,3 rows should be expanded.");
  });
});

test('expand to level 3 and collapse to level 2 and collapse level 1', function (assert) {
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(3);
  component.expandToLevel(2);
  component.expandToLevel(1);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(2, [0]), [
      ["as-1"],
      ["as-2"]
    ], "should collapse to level 1.");
  });
});

test('expand to level 1, expand first grouper then expand to level 1 again', function(assert){
  var component = this.subject({height: 1000});
  this.render();

  component.expandToLevel(1);
  component.clickGroupIndicator(0);
  component.expandToLevel(1);

  return component.ready(() => {
    assert.deepEqual(component.cellsContent(2, [0]), [
      ["as-1"],
      ["as-2"]
    ], "should collapse to level 1.");
  });
});
