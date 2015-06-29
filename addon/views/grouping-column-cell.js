import Ember from 'ember';
import TableCell from './table-cell';
import GroupedRowIndicator from './grouped-row-indicator';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableCell.extend(
  RegisterTableComponentMixin, {

  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  styleBindings: ['padding-left'],

  groupedRowIndicatorView: Ember.computed(function(){
    var view =  this.get('tableComponent.groupedRowIndicatorView');
    return view || GroupedRowIndicator;
  }).property('tableComponent.groupedRowIndicatorView'),

  hasChildren: Ember.computed(function() {
    return this.get('expandLevel') < this.get('tableComponent.groupingMetadata.length');
  }).property('expandLevel', 'tableComponent.groupingMetadata.length'),

  expandLevel: Ember.computed.oneWay('row.expandLevel'),

  actions: {
    toggleExpansionState: function() {
      var row = this.get('row');
      var target = row.get('target');
      if (this.get('isExpanded')) {
        target.collapseChildren(row);
      } else {
        target.expandChildren(row);
      }
      this.get('column').expandedDepthChanged(target.get('_expandedDepth'));
    }
  },

  "padding-left": Ember.computed(function() {
    return this.get('expandLevel') * 10 + 5;
  }).property('expandLevel'),

  isExpanded: Ember.computed.alias('row.isExpanded')
});