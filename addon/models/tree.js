import Ember from 'ember';
import LazyArrayWithPlaceholder from 'ember-table/models/lazy-array-with-placeholder';

let Tree = Ember.ObjectProxy.extend({
  // Not grand total row
  isVirtual: true,

  content: null,

  isExpanded: false,

  level: 0,

  objectAt: function (idx) {
    if(!this.get('isVirtual')) {
      if (idx === 0) {
        return this;
      }
      idx--;
    }
    let result;
    let placeholderCount = 1;
    this.get('children').find((row) => {
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

  loadedChildrenLengths: Ember.computed.mapBy('children.content', 'length'),

  loadedCountDidChange: Ember.observer('children.content.@each.length', function () {
    Ember.run.once(() => {
      let lengths = this.get('children.content').getEach('length');
      let loadedCount = lengths.reduce((res, i) => i + res, 0);
      this.set('loadedCount', loadedCount);
    });
  }),

  loadedCount: 0,

  length: Ember.computed('loadedCount', 'children.isCompleted', 'isExpanded', function () {
    if (!this.get('isExpanded') && !this.get('isVirtual')) {
      return 1;
    }
    let loadedCount = this.get('loadedCount');
    let placeholderCount = this.get('children.isCompleted') ? 0 : 1;
    let rootCount = this.get('isVirtual') ? 0 : 1;
    return loadedCount + placeholderCount + rootCount;
  }),

  meta: null,

  parent: null,

  query: null,

  children: Ember.computed('meta.load', function () {
    let meta = this.get('meta');
    let load = this.get('meta.load');
    let placeholder = this.get('meta.placeholder');
    let childLevel = this.get('level') + 1;
    return LazyArrayWithPlaceholder.create({
      load,
      placeholder,
      createChild: (content) => Tree.create({
        content,
        parent: this,
        meta,
        level: childLevel,
        isVirtual: false
      }),
      chunkDidLoad: function (res) {
        this.set('totalCount', res.meta.totalCount);
        this.set('chunkSize', res.meta.chunkSize);
      }
    });
  })
});

export default Tree;
