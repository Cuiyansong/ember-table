import Ember from 'ember';

export default Ember.ObjectProxy.extend({

  init: function () {
    this._super();
    this.set('subControllers', Ember.A());
    // TODO: content/tree inject properties here.
    this.set('content.meta.groupingMetadata', this.get('target.groupMeta.groupingMetadata'));
    this.set('content.meta.sortingColumns', this.get('target.sortingColumns'));
    this.set('content.meta.expandedStates', Ember.Object.create());
  },

  // The parent ember-table include groupingMetadata and isVirtual, etc.
  target: null,

  // For now, it is the same as target.
  parentController: null, // TODO: no use

  subControllers: null,

  // Should be given on init, for now it is 'group-row'.
  itemController: null,

  // Should be given on init, for now it is 'tree'.
  content: null,

  grandTotalClass: null,

  objectAt: function (idx) {
    let content = this.get('content').objectAt(idx);
    let target = this.get('target');
    // TODO: remove duplicated controller.
    return this.get('itemController').create({
      content,
      target,
      parentController: this.get('target') // TODO: Seemed no use
    });
  },

  sort: function (sortingColumns) {
    let content = this.get('content');
    if(content && content.sort) {
      content = sortingColumns.sortContent(content);
      this.set('content', content);
    }
  },

  // =========== Sort ==========
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
  // =====================

  // Default arrayContentDidChange will access last object,
  // for lazy loaded array, we don't want that happen.
  arrayContentDidChange: function(startIdx, removeAmt, addAmt) {
    if (!this.get('content.isEmberTableContent') || this.get('content.isCompleted')) {
      this._super(startIdx, removeAmt, addAmt);
    }
  },

  _isLastItem: function(idx) {
    return idx === this.get('length') - 1;
  }

  //controllerAt: function(idx, object) {
  //  console.log(idx, object);
  //  var subControllers = this.get('_subControllers');
  //  console.log(subControllers);
  //  var subController = subControllers[idx];
  //  if (subController) {
  //    return subController;
  //  }
  //  if (!object && this.get('content.isEmberTableContent')) {
  //    object = this.get('content').objectAt(idx + 1);
  //  }
  //  subController = this.get('itemController').create({
  //    target: this,
  //    parentController: this.get('parentController') || this,
  //    content: object
  //  });
  //  subControllers[idx] = subController;
  //  if (this._isLastItem(idx)) {
  //    this.set('lastItem', subController);
  //  }
  //  return subController;
  //},
});
