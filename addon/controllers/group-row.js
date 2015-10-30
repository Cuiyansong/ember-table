import Ember from 'ember';
import Row from './row';

var GroupRow = Row.extend({

    //subRowsCount: Ember.computed(function () {
    //  if (!this.get('isExpanded')) {
    //    return 0;
    //  }
    //  var childrenCount = this.get('_childrenRow.length') || 0;
    //  var childrenExpandedCount = 0;
    //  if (this.get('_childrenRow.length') > 0) {
    //    childrenExpandedCount = this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
    //      if (!item) {
    //        return previousValue;
    //      }
    //      return previousValue + item.get('subRowsCount');
    //    }, 0);
    //  }
    //  return childrenCount + childrenExpandedCount;
    //}).property('isExpanded', '_childrenRow.definedControllersCount', '_childrenRow.@each.subRowsCount', '_childrenRow.length'),
    //
    //_childrenRow: null,

    //createChildrenRow: function () {
    //  if (!this.get('_childrenRow')) {
    //    this.set('_childrenRow', SubRowArray.create({
    //      content: this.get('children')
    //    }));
    //  }
    //},

    //findRow: function (idx) {
    //  var subRows = this.get('_childrenRow');
    //  if (!subRows) {
    //    return undefined;
    //  }
    //  var p = idx;
    //  for (var i = 0; i < subRows.get('length'); i++) {
    //    if (p === 0) {
    //      return subRows.objectAt(i);
    //    }
    //    var row = subRows.objectAt(i);
    //    p--;
    //    if (row && row.get('isExpanded')) {
    //      var subRowsCount = row.get('subRowsCount');
    //      if (p < subRowsCount) {
    //        return row.findRow(p);
    //      } else {
    //        p -= subRowsCount;
    //      }
    //    }
    //  }
    //  return undefined;
    //},
    //
    //createRow: function (idx) {
    //  var subRows = this.get('_childrenRow');
    //  if (!subRows) {
    //    return undefined;
    //  }
    //  var p = idx;
    //  for (var i = 0; i < subRows.get('length'); i++) {
    //    if (p === 0) {
    //      var content = subRows.objectAtContent(i);
    //      if (content && Ember.get(content, 'isLoading')) {
    //        Ember.set(content, 'contentLoadedHandler', Ember.Object.create({
    //          target: subRows,
    //          index: i
    //        }));
    //        var subRowsContent = this.get('children');
    //        if (subRowsContent.get('loadChildren')) {
    //          var group = Ember.Object.create({
    //            query: this.get('path').toQuery(),
    //            key: this.get('nextLevelGrouping.key')
    //          });
    //          subRowsContent.triggerLoading(i, this.get('target'), group);
    //        }
    //      }
    //      var newRow = this.get('itemController').create({
    //        target: this.get('target'),
    //        parentController: this.get('parentController'),
    //        content: content,
    //        expandLevel: this.get('expandLevel') + 1,
    //        grouping: this.get('nextLevelGrouping'),
    //        itemController: this.get('itemController'),
    //        parentRow: this
    //      });
    //      //It can be an old controller.
    //      newRow = subRows.setControllerAt(newRow, i);
    //      newRow.tryExpandChildren();
    //      return newRow;
    //    }
    //    var row = subRows.objectAt(i);
    //    p--;
    //    if (row && row.get('isExpanded')) {
    //      var subRowsCount = row.get('subRowsCount');
    //      if (p < subRowsCount) {
    //        return row.createRow(p);
    //      } else {
    //        p -= subRowsCount;
    //      }
    //    }
    //  }
    //  return undefined;
    //},

    //children: Ember.computed(function () {
    //  var loadChildren = this.get('target.groupMeta.loadChildren');
    //  return this.get('content.children') || LazyGroupRowArray.create({loadChildren: loadChildren});
    //}).property('target.groupMeta.loadChildren', 'grouping.isGroup'),

    //_previousGrouperSortDirection: null,
    //

    //
    //sorter: Ember.computed('nextLevelGrouping.sortDirection', 'target.sortingColumns._columns', function () {
    //  if (this.get('nextLevelGrouping.sortDirection')) {
    //    return this.get('nextLevelGrouping');
    //  }
    //  if (this.get('target.sortingColumns.isNotEmpty')) {
    //    return this.get('target.sortingColumns');
    //  }
    //}),
    //
    //sortByCondition: function () {
    //  if (this.get('children.isNotCompleted')) {
    //    var content = LazyGroupRowArray.create({loadChildren: this.get('target.groupMeta.loadChildren')});
    //    this.set('children', content);
    //    this.recreateChildrenRow(content);
    //  } else {
    //    var sorter = this.get('sorter');
    //    if (sorter) {
    //      this.recreateChildrenRow(sorter.sortContent(this.get('children')));
    //    }
    //  }
    //},
    //
    //recreateChildrenRow: function (content) {
    //  this.set('_childrenRow', SubRowArray.create({
    //    content: content,
    //    oldControllersMap: this.get('_childrenRow').getAvailableControllersMap(),
    //    isContentIncomplete: this.get('children.isNotCompleted')
    //  }));
    //  this.notifyLengthChange();
    //},
    //
    //notifyLengthChange: function() {
    //  if (this.get('target')) {
    //    this.get('target').notifyPropertyChange('length');
    //  }
    //},

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
    }),

    // trigger callback when data is loaded
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
      let selfLevel = this.get('expandLevel') + 1; //convert to 1-based
      let targetLevel = this.get('target.groupMeta.expandToLevelAction.level');
      if (selfLevel < targetLevel) {
        if (this.get('isLoaded') && !this.get('isExpanded')) {
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
