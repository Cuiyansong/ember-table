import Ember from 'ember';
import LazyArrayWithPlaceholder from 'ember-table/models/lazy-array-with-placeholder';

let Tree = Ember.ObjectProxy.extend({
  // Not grand total row
  isVirtual: Ember.computed.not('content'),

  isEmberTableContent: true,

  content: null,

  isExpanded: false,

  // The tree node level
  level: 0,

  meta: null,

  parent: null,

  loadedCount: 0,

  grouper: Ember.computed('groupingMetadata.[]', 'level', function () {
    return this.get('groupingMetadata').objectAt(this.get('level') - 1);
  }),

  nextLevelGrouper: Ember.computed('groupingMetadata.[]', 'level', function () {
    return this.get('groupingMetadata').objectAt(this.get('level'));
  }),

  sortingColumns: Ember.computed.alias('meta.sortingColumns'),

  groupingMetadata: Ember.computed.alias('meta.groupingMetadata'),

  loadedChildrenLengths: Ember.computed.mapBy('children.content', 'length'),

  isChildrenCompleted: Ember.computed.oneWay('children.isCompleted'),

  // TODO: it seemed no use
  //root: Ember.computed.alias('meta.root'),

  init: function () {
    this._super();
    this.initExpandedState();
    this.initContent();
  },

  initExpandedState: function () {
    let expandedStates = this.get('meta.expandedStates');
    if (expandedStates) {
      let id = this.get('id');
      this.set('isExpanded', expandedStates.get(id.toString()));
    }
  },

  initContent: function () {
    let content = this.get('content');
    if (content && content.then) {
      content.then((res) => {
        this.set('content', res);
      });
    }
  },

  expand: function () {
    this._saveToExpandState(true);
  },

  collapse: function () {
    this._saveToExpandState(false);
  },

  _saveToExpandState: function (isExpanded) {
    this.set('isExpanded', isExpanded);
    let expandedStates = this.get('meta.expandedStates');
    expandedStates.set(this.get('id').toString(), isExpanded);
  },

  objectAt: function (idx) {
    if (!this.get('isVirtual')) {
      if (idx === 0) {
        return this;
      }
      idx--;
    }
    let result = {};
    let placeholderCount = 1;
    this.get('children').find((row) => {
      if (!row) {
        idx--;
        return false;
      }
      let rowLength = Ember.getWithDefault(row, 'length', placeholderCount);
      let isOk = idx < rowLength;
      if (isOk) {
        result = idx === 0 ? row : row.objectAt(idx);
      } else {
        idx = idx - rowLength;
      }
      return isOk;
    });
    return result;
  },

  loadedCountDidChange: Ember.observer('children.content.@each.length', function () {
    Ember.run.once(() => {
      let lengths = this.get('children.content').getEach('length');
      let loadedCount = lengths.reduce((res, i) => i + res, 0);
      this.set('loadedCount', loadedCount);
    });
  }),

  length: Ember.computed('loadedCount', 'children.isCompleted', 'children.content.@each', 'isExpanded', function () {
    if (!this.get('isExpanded') && !this.get('isVirtual')) {
      return 1;
    }
    let loadedCount = this.get('loadedCount');
    let placeholderCount = this.get('children.isCompleted') ? 0 : 1;
    let rootCount = this.get('isVirtual') ? 0 : 1;
    return loadedCount + placeholderCount + rootCount;
  }),

  getGroupQuery: function () {
    if (this.get('isVirtual')) {
      // TODO: Grand Total
      return {
        grouperKey: this.get('nextLevelGrouper.id'),
        grouperSortDirection: this.get('nextLevelGrouper.sortDirection'),
        paths: []
      };
    }
    else {
      var meta = this.get('groupingMetadata') || [];
      let queries = [].concat(this.get('parent') ? this.get('parent').getGroupQuery().paths : []);
      var grouper = meta[this.get('level') - 1];
      if (grouper) {
        let groupKey = Ember.get(grouper, 'id');
        let value = this.get('id');
        queries.push({name: groupKey, value});
      }
      let res = {
        grouperKey: this.get('nextLevelGrouper.id'),
        paths: queries
      };
      let grouperSortDirection = this.get('nextLevelGrouper.sortDirection');
      if (grouperSortDirection) {
        res.grouperSortDirection = grouperSortDirection;
      }
      return res;
    }
  },

  children: Ember.computed('loadedChildren', 'normalArrayChildren', function () {
    let contentChildren = this.get('content.children');
    return contentChildren ? this.get('normalArrayChildren') : this.get('loadedChildren');
  }),

  normalArrayChildren: Ember.computed('content.children.[]',function () {
    let contentChildren = this.get('content.children');
    let children = LazyArrayWithPlaceholder.create({
      content: contentChildren.map((i) => this.get('_createChild')(i)),
      totalCount: Ember.get(contentChildren, 'length')
    });
    // TODO: trigger calculate loadedCount for normal array.
    this.loadedCountDidChange();
    return children;
  }),

  loadedChildren: Ember.computed('meta.load', function () {
    let load = this.get('meta.load');
    let placeholder = this.get('meta.placeholder');
    return LazyArrayWithPlaceholder.create({
      load: (chunkIndex) => {
        return load(chunkIndex, this.get('sortingColumns'), this.getGroupQuery());
      },
      placeholder,
      createChild: this.get('_createChild'),
      chunkDidLoad: function (res) {
        this.set('totalCount', parseInt(res.meta.totalCount));
        this.set('chunkSize', parseInt(res.meta.chunkSize));
      }
    });
  }),

  _createChild: Ember.computed('meta', 'level', function () {
    let childLevel = this.get('level') + 1;
    let meta = this.get('meta');
    return (content) => {
      return Tree.create({
        content: content,
        parent: this,
        meta,
        level: childLevel,
        isVirtual: false
      });
    };
  })
});

export default Tree;
