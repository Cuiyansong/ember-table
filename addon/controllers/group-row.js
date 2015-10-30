import Ember from 'ember';
import Row from './row';

var GroupRow = Row.extend({

    // This is tree model
    content: null,

    expandChildren: function () {
      this.get('content').expand();
    },

    collapseChildren: function () {
      this.get('content').collapse();
    },

    groupName: Ember.computed('grouper.id', 'content.groupName', function () {
      return this.get('content.' + this.get('grouper.id')) || this.get('content.groupName');
    }),

    sortingColumnsDidChange: Ember.observer('sortingColumns._columns', function () {
      if (this.get('children') && !this.get('nextLevelGrouper.sortDirection')) {
        this.sortByCondition();
      }
    }),

    _previousGrouperSortDirection: null,

    sortingGrouperDidChange: Ember.observer('nextLevelGrouper.sortDirection', function () {
      if (this.get('children')) {
        var previousSortDirection = this.get('_previousGrouperSortDirection');
        var currentSortDirection = this.get('nextLevelGrouper.sortDirection');
        if (previousSortDirection !== currentSortDirection) {
          this.sortByCondition();
          this.set('_previousGrouperSortDirection', currentSortDirection);
        }
      }
    }),

    // ----------------------
    sortFn: Ember.computed('nextLevelGrouper.sortDirection', 'sortingColumns._columns', function () {
      if (this.get('nextLevelGrouper.sortDirection')) {
        let sortFn = this.get('nextLevelGrouper.sortFn') || this.get('grouperDefaultSortFn');
        return (prev, next) => sortFn(prev, next) * this.get('groupSortFactor');
      }
      if (this.get('sortingColumns.isNotEmpty')) {
        let sortingColumns = this.get('sortingColumns');
        return (prev, next) => sortingColumns.sortBy(prev, next);
      }
    }),

    sortByCondition: function () {
      let children = this.get('children');
      if (this.get('isChildrenCompleted')) {
        let sortFn = this.get('sortFn');
        if (sortFn) {
          children.sort(sortFn);
        }
      } else {
        children.clear();
      }
    },
    // ----------------------

    groupSortFactor: Ember.computed('nextLevelGrouper.sortDirection', function () {
      var sortDirection = this.get('nextLevelGrouper.sortDirection');
      if (sortDirection) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    }),

    grouperDefaultSortFn: Ember.computed('nextLevelGrouper.id', function() {
      var key = this.get('nextLevelGrouper.id');
      return function (prev, next) {
        return Ember.compare(Ember.get(prev, key), Ember.get(next, key));
      };
    }),

    hasChildren: Ember.computed('groupingMetadata.[]', 'level', function() {
      return this.get('level') < this.get('groupingMetadata.length');
    }),

    //rowStyle: Ember.computed.oneWay('grandTotalClass'),

    //grandTotalClass: Ember.computed('grouping.grandTotalClass', 'grouping.isGrandTotal', function () {
    //  return this.get('grouping.isGrandTotal') ? this.get('grouping.grandTotalClass') : '';
    //}),
    //


    groupingLevel: Ember.computed.oneWay('content.level'),

    grandTotalTitle: Ember.computed.oneWay('target.groupMeta.grandTotalTitle'),

    //nextLevelGrouping: Ember.computed.alias('grouping.nextLevelGrouping'),

    parentRow: null,

    expandToLevelActionTriggered: Ember.observer('target.groupMeta.expandToLevelAction', function () {
      this.tryExpandChildren();
    }).on('init'),

    // trigger callback when data is loaded
    // TODO: seemed no use
    contentDidLoad: Ember.observer('isLoaded', function() {
      this.tryExpandChildren();
      this.tryExpandGrandTotalRow();
    }),

    tryExpandGrandTotalRow: function () {
      if (this.get('grouping.isGrandTotal') && this.get('grouping.isGrandTotalExpanded')) {
        this.expandChildren();
      }
    },

    tryExpandChildren: function() {
      let selfLevel = this.get('level');
      let targetLevel = this.get('target.groupMeta.expandToLevelAction.level');
      if (selfLevel < targetLevel) {
        if (!this.get('isExpanded')) {
          this.expandChildren();
        }
      }
      if (selfLevel === targetLevel) {
        if (this.get('isExpanded')) {
          this.collapseChildren();
        }
      }
    }
  }
);

export default GroupRow;
