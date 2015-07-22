import Ember from 'ember';
import LazyGroupRowArray from './lazy-group-row-array';

var GroupRowProxy = Ember.ObjectProxy.extend({
  status: null,
  loadChildren: Ember.K,
  onLoadError: Ember.K,

  groupingMetadata: null,

  groupingLevel: 0,

  groupingName: Ember.computed(function () {
    var groupingLevel = this.get('groupingLevel');
    var groupingMetadata = this.get('groupingMetadata');
    if (groupingLevel >= 0 && groupingLevel < groupingMetadata.length) {
      return Ember.get(this.get('groupingMetadata').objectAt(groupingLevel), 'id');
    } else {
      return null;
    }
  }).property('groupingMetadata', 'groupingLevel'),

  selfQuery: Ember.computed(function () {
    var query = {};
    var groupingName = this.get('groupingName');
    if (groupingName) {
      query[groupingName] = this.get('content.id');
    }
    return Ember.setProperties(query, this.get('parentQuery') || {});
  }).property('content'),

  children: Ember.computed(function () {
    return LazyGroupRowArray.create({
      loadChildren: this.loadChildren,
      onLoadError: this.onLoadError,
      groupingLevel: this.get('groupingLevel') + 1,
      groupingMetadata: this.get('groupingMetadata'),
      parentQuery: this.get('selfQuery'),
      status: this.get('status'),
      root: this.get('root')
    });
  }).property(),

  groupName: Ember.computed(function() {
    var groupingName = this.get('groupingName');
    if (groupingName) {
      return this.get(groupingName);
    }
    return "";
  }).property('groupingName', 'content'),

  sortingColumns: Ember.computed.oneWay('root.sortingColumns')
});

export default GroupRowProxy;
