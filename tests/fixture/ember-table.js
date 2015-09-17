import Ember from 'ember';
import ColumnFixture from './columns';
import * as StableSort from 'ember-table/initializers/stable-sort';
export default Ember.Component.extend({
  init: function(){
    this._super();
    StableSort.initialize();
  },

  height: 330,
  width: 1500,

  layout: Ember.Handlebars.compile(
    '{{ember-table ' +
    ' columns=columns ' +
    ' hasFooter=hasFooter ' +
    ' groupedRowIndicatorViewName=groupedRowIndicatorViewName ' +
    ' rowLoadingIndicatorViewName=rowLoadingIndicatorViewName ' +
    ' content=content' +
    ' enableContentSelection=true' +
    ' numFixedColumns=numFixedColumns' +
    ' groupMeta=groupMeta' +
    '}} '),
  columns: Ember.computed(function () {
    var columnFixture = ColumnFixture.create();
    return [
      columnFixture.get('firstColumn'),
      columnFixture.get('secondColumn'),
      columnFixture.get('thirdColumn')
    ];
  }),
  attributeBindings: ['style'],
  style: function() {
    return 'height:%@px;width:%@px;position:relative;'.fmt(this.get('height'), this.get('width'));
  }.property('height'),
  hasFooter: false,
  enableContentSelection: true,
  content: [],
  numFixedColumns: 0,
  groupedRowIndicatorViewName: null,
  rowLoadingIndicatorViewName: null,
  groupMeta: null,
  setGrouperSortDirection: function(grouperIndex, sortDirection) {
    var grouper = this.get('groupMeta.groupingMetadata').objectAt(grouperIndex);
    Ember.set(grouper, 'sortDirection', sortDirection);
  }
});
