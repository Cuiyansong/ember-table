import Ember from 'ember';

export default Ember.ArrayProxy.extend({

  groupingMetadata: Ember.computed.alias('content.groupingMetadata'),
  grandTotalTitle: Ember.computed.alias('content.grandTotalTitle'),
  loadGrandTotal: Ember.computed.alias('content.loadGrandTotal'),

  // This property contains all sorted columns.
  sortingColumns: null,

  _content: Ember.computed(function () {
    var content = this.get('content');
    var sortingColumns = this.get('sortingColumns');
    if (sortingColumns && sortingColumns.get('isNotEmpty')) {
      return content.slice().sort(function(prev, next) {
        return sortingColumns.sortBy(prev, next);
      });
    } else {
      return content.slice();
    }
  }).property('sortingColumns'),

  objectAt: function (index) {
    return this.get('_content').objectAt(index);
  }
});
