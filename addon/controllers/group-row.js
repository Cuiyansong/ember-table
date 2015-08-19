import Ember from 'ember';
import Row from './row';
import SubRowArray from './sub-row-array';
import LazyGroupRowArray from '../models/lazy-group-row-array';

var GroupRow = Row.extend({
    expandedDepth: Ember.computed(function () {
      var expandLevel = this.get('expandLevel');
      if (this.get('isExpanded')) {
        if (this.get('_childrenRow.length') > 0) {
          return this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
            if (!item) {
              return previousValue;
            }
            var expandedDepth = item.get('expandedDepth');
            if (expandedDepth > previousValue) {
              return expandedDepth;
            }
            return previousValue;
          }, expandLevel + 1);
        }
      }
      return expandLevel;
    }).property('expandLevel', 'isExpanded', '_childrenRow.definedControllersCount', '_childrenRow.@each.expandedDepth'),

    subRowsCount: Ember.computed(function () {
      if (!this.get('isExpanded')) {
        return 0;
      }
      var childrenCount = this.get('_childrenRow.length') || 0;
      var childrenExpandedCount = 0;
      if (this.get('_childrenRow.length') > 0) {
        childrenExpandedCount = this.get('_childrenRow').definedControllers().reduce(function (previousValue, item) {
          if (!item) {
            return previousValue;
          }
          return previousValue + item.get('subRowsCount');
        }, 0);
      }
      return childrenCount + childrenExpandedCount;
    }).property('isExpanded', '_childrenRow.definedControllersCount', '_childrenRow.@each.subRowsCount', '_childrenRow.length'),

    _childrenRow: null,

    expandChildren: function () {
      this.set('isExpanded', true);
      this.createChildrenRow();
    },

    createChildrenRow: function () {
      if (!this.get('_childrenRow')) {
        this.set('_childrenRow', SubRowArray.create({
          content: this.get('children')
        }));
      }
    },

    collapseChildren: function () {
      this.set('isExpanded', false);
    },

    subRowsCountDidChange: Ember.observer('subRowsCount', function () {
      var parentRow = this.get('parentRow');
      if (parentRow) {
        parentRow.notifyPropertyChange('subRowsCount');
      }
    }),

    sort: function (sortingColumns) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return;
      }
      var groupingRowAffectedByColumnSort = this.get('target.groupMeta.groupingRowAffectedByColumnSort');
      if (groupingRowAffectedByColumnSort) {
        if (!this.get('nextLevelGrouping.sortDirection')) {
          var newSubRowArray = SubRowArray.create({
            content: sortingColumns.sortContent(this.get('children')),
            oldObject: this.get('_childrenRow')
          });
          this.set('_childrenRow', newSubRowArray);
        }
      } else {
        if (this.get('grouping.isLeafParent')) {
          subRows.willDestroy();
          var newContent;
          if (this.get('children.isNotCompleted')) {
            newContent = this.get('children');
            newContent.resetContent();
          } else {
            newContent = sortingColumns.sortContent(this.get('children'));
          }
          this.set('_childrenRow', SubRowArray.create({
            content: newContent
          }));
          return;
        }
      }
      this.invokeSortOnSubRows(sortingColumns);
    },

    invokeSortOnSubRows: function(sortingColumns) {
      var subRows = this.get('_childrenRow');
      subRows.forEach(function (r) {
        if (r) {
          r.sort(sortingColumns);
        }
      });
    },

    sortByGroupers: function () {
      var children = this.get('children');
      if (!children) {
        return;
      }
      if (this.get('children.isNotCompleted')) {
        this.set('children', LazyGroupRowArray.create());
        this.set('_childrenRow', SubRowArray.create({
          content: this.get('children')
        }));
      } else {
        var grouping = this.get('nextLevelGrouping');
        var sortContent = grouping.sortContent(children);
        this.set('_childrenRow', SubRowArray.create({
          content: sortContent,
          oldObject: this.get('_childrenRow')
        }));
      }
      this.invokeSortByGrouperOnSubRows();
    },

    invokeSortByGrouperOnSubRows: function() {
      var subRows = this.get('_childrenRow');
      if (subRows) {
        subRows.forEach(function(controller) {
          if(controller) {
            controller.sortByGroupers();
          }
        });
      }
    },

    findRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }
      var p = idx;
      for (var i = 0; i < subRows.get('length'); i++) {
        if (p === 0) {
          return subRows.objectAt(i);
        }
        var row = subRows.objectAt(i);
        p--;
        if (row && row.get('isExpanded')) {
          var subRowsCount = row.get('subRowsCount');
          if (p < subRowsCount) {
            return row.findRow(p);
          } else {
            p -= subRowsCount;
          }
        }
      }
      return undefined;
    },

    createRow: function (idx) {
      var subRows = this.get('_childrenRow');
      if (!subRows) {
        return undefined;
      }
      var p = idx;
      for (var i = 0; i < subRows.get('length'); i++) {
        if (p === 0) {
          var content = subRows.objectAtContent(i);
          if (content && Ember.get(content, 'isLoading')) {
            var subRowsContent = this.get('children');
            if (subRowsContent.triggerLoading) {
              subRowsContent.triggerLoading(i, this.get('target'), this.get('nextLevelGrouping'));
            }
          }
          var newRow = this.get('itemController').create({
            target: this.get('target'),
            parentController: this.get('parentController'),
            content: content,
            expandLevel: this.get('expandLevel') + 1,
            grouping: this.get('nextLevelGrouping'),
            itemController: this.get('itemController'),
            parentRow: this
          });
          subRows.setControllerAt(newRow, i);
          return newRow;
        }
        var row = subRows.objectAt(i);
        p--;
        if (row && row.get('isExpanded')) {
          var subRowsCount = row.get('subRowsCount');
          if (p < subRowsCount) {
            return row.createRow(p);
          } else {
            p -= subRowsCount;
          }
        }
      }
      return undefined;
    },

    children: Ember.computed(function () {
      if (this.get('target.groupMeta.loadChildren') && this.get('grouping.isGroup') && this.get('expandLevel') >= 0) {
        return LazyGroupRowArray.create();
      }
      return this.get('content.children');
    }).property('target.groupMeta.loadChildren', 'grouping.isGroup'),

    hasChildren: Ember.computed.oneWay('grouping.isGroup'),

    isExpanded: false,

    expandLevel: null,
    grandTotalTitle: Ember.computed.oneWay('target.groupMeta.grandTotalTitle'),
    grouping: null,
    groupingKey: Ember.computed.oneWay('grouping.key'),
    groupName: Ember.computed(function () {
      if (this.get('grouping.isGrandTotal')) {
        return this.get('grandTotalTitle');
      }
      return this.get('content.' + this.get('grouping.key'));
    }).property('content', 'content.isLoaded', 'grouping.key'),

    nextLevelGrouping: Ember.computed(function () {
      var grouping = this.get('grouping');
      return grouping.nextLevel(this.get('content'));
    }).property('content', 'grouping'),

    parentRow: null,

    parentContent: Ember.computed.oneWay('parentRow.content')
  }
);


export default GroupRow;