import Ember from 'ember';
import TableCell from './table-cell';
import RegisterTableComponentMixin from 'ember-table/mixins/register-table-component';

export default TableCell.extend(
  RegisterTableComponentMixin, {

  templateName: 'grouping-column-cell',

  classNames: ['grouping-column-cell'],

  classNameBindings: 'dataClasses',

  styleBindings: ['padding-left'],

  groupedRowIndicatorView: Ember.computed(function(){
    var customizeViewName =  this.get('tableComponent.groupedRowIndicatorViewName');
    var viewName = customizeViewName ? customizeViewName : this._defaultGroupIndicatorViewName;
    return this.container.lookupFactory('view:' + viewName);
  }).property('tableComponent.groupedRowIndicatorViewName'),

  groupedRowIndicatorViewDidChange: Ember.observer('groupedRowIndicatorView', function() {
    this.rerender();
  }),

  _defaultGroupIndicatorViewName: 'grouped-row-indicator',

  hasChildren: Ember.computed(function() {
    return this.get('row.hasChildren') || this.get('row.level') < this.get('tableComponent.groupingMetadata.length');
  }).property('groupingLevel', 'tableComponent.groupingMetadata.length'),

  expandLevel: Ember.computed('row.level', 'tableComponent.hasTotalRow', function () {
    let level = this.getWithDefault('row.level', 0);
    return this.get('tableComponent.hasTotalRow') ? level + 1 : level;
  }),

  groupingLevel: Ember.computed.alias('row.groupingLevel'),

  actions: {
    toggleExpansionState: function() {
      var row = this.get('row');
      if (row) {
        if (this.get('isExpanded')) {
          row.collapseChildren();
        } else {
          row.expandChildren();
        }
      }
    }
  },

  groupIndicatorWidth: Ember.computed.alias('tableComponent.groupIndicatorWidth'),

  "padding-left": Ember.computed(function () {
    var groupIndicatorWidth = this.get('groupIndicatorWidth');
    var numOfGroupIndicators = this.get('expandLevel');
    return numOfGroupIndicators * groupIndicatorWidth + 5;
  }).property('expandLevel', 'groupIndicatorWidth'),

  isExpanded: Ember.computed.alias('row.isExpanded'),

  dataClasses: Ember.computed('tableComponent.groupingMetadata.[]', 'groupingLevel', function() {
    let groupingMetadata = this.get('tableComponent.groupingMetadata');
    let groupingLevel = this.get('groupingLevel');

    if (groupingMetadata && groupingLevel >= 0 && groupingLevel < groupingMetadata.length) {
      var grouper = groupingMetadata[groupingLevel] || {};
      let dataClasses = Ember.get(grouper, 'dataClasses');
      if (dataClasses) {
        return dataClasses.join(' ');
      }
    }
    return '';
  })
});
