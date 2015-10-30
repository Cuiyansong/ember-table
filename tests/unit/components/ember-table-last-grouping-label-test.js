import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForEmberTable from '../../helpers/module-for-ember-table';
import EmberTableFixture from '../../fixture/ember-table';
import GlData from '../../fixture/ember-table-with-gl-data';
import EmberTableHelper from '../../helpers/ember-table-helper';
import DeferPromises from '../../fixture/defer-promises';
import Tree from 'ember-table/models/tree';

moduleForEmberTable('one level grouping',
  function () {
    let defers = DeferPromises.create();
    let glData = GlData.create({defers: defers});
    return EmberTableFixture.create({
      height: 600,
      width: 700,
      groupMeta: {groupingMetadata: glData.get('groupingMetadata')},
      content: Tree.create({
        meta: {
          load: glData.get('loadChildren'),
          placeholder: Ember.Object.create({isLoading: true})
        }
      })
    });
  });

test('show last grouping label', function (assert) {
  var component = this.subject();
  var helper = EmberTableHelper.create({_assert: assert, _component: component});

  this.render();

  component.ready(function() {
    var firstRowIndicator = helper.rowGroupingIndicator(0);
    assert.equal(firstRowIndicator.length, 1, 'first row should be grouping row');
    firstRowIndicator.click();
  });

  return component.ready(function () {
    assert.equal(helper.fixedBodyCell(1, 0).text().trim(), 'accountType-0', 'last grouping label should be visible');
    assert.equal(helper.rowGroupingIndicator(1).length, 0, 'should have no grouping indicator for last grouping');
  });
});
