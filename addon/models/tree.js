import Ember from 'ember';
import LazyArrayWithPlaceholder from 'ember-table/models/lazy-array-with-placeholder';

let Tree = Ember.ObjectProxy.extend({
  content: null,

  isExpanded: false,

  objectAt: function (idx) {
    if (idx === 0) {
      return this;
    }
    idx--;
    let result;
    this.get('children').find((row) => {
      let placeholderCount = 1;
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

  loadedCount: Ember.computed.sum('loadedChildrenLengths'),

  length: Ember.computed('loadedCount', 'children.isCompleted', 'isExpanded', function () {
    if (!this.get('isExpanded')) {
      return 1;
    }
    let loadedCount = this.get('loadedCount');
    let placeholderCount = this.get('children.isCompleted') ? 0 : 1;
    return loadedCount + placeholderCount + 1;
  }),

  meta: null,

  parent: null,

  query: null,

  children: Ember.computed('meta.load', function () {
    let meta = this.get('meta');
    let load = this.get('meta.load');
    let placeholder = this.get('meta.placeholder');
    return LazyArrayWithPlaceholder.create({
      load,
      placeholder,
      createChild: (content) => Tree.create({
        content,
        parent: this,
        meta
      })
    });
  })
});

export default Tree;
