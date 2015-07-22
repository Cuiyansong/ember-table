import Ember from 'ember';
import TableContent from './table-content';

var GroupedArray = TableContent.extend({

  root: null,
  groupingLevel: 0,

  init: function () {
    this.wrapSubChildren();
  },

  sortingColumns: Ember.computed.oneWay('root.sortingColumns'),

  groupingMetadata: Ember.computed(function () {
    if (this.get('groupingLevel') === 0) {
      return this.get('content.groupingMetadata');
    } else {
      return this.get('root.groupingMetadata');
    }
  }).property('root.groupingMetadata', 'content.groupingMetadata'),

  wrapSubChildren: function () {
    var self = this;
    var content = this.get('content');
    content.forEach(function (item) {
      var children = Ember.get(item, 'children');
      if (children) {
        Ember.set(item, 'children', GroupedArray.create({
          content: children,
          groupingLevel: self.groupingLevel + 1,
          root: self.get('root') || self
        }));
      }
    });
  },

  isLeafCollection: Ember.computed(function () {
    return this.get('groupingLevel') === this.get('groupingMetadata.length') - 1;
  }).property('groupingLevel', 'groupingMetadata.[]'),

  _content: Ember.computed(function () {
    var content = this.get('content');
    if (!this.get('isLeafCollection')) {
      return content;
    }
    return this._super();
  }).property('sortingColumns')
});

export default GroupedArray;
