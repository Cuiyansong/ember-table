import Ember from 'ember';

export default Ember.ObjectProxy.extend({

  init: function () {
    this._super();
    this.set('subControllers', Ember.A());
  },

  subControllers: null,

  itemController: null,

  content: null,

  objectAt: function (idx) {
    let content = this.get('content').objectAt(idx);
    return this.get('itemController').create({
      content,
      parentController: this.get('target')
    });
  },

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

  // Default arrayContentDidChange will access last object,
  // for lazy loaded array, we don't want that happen.
  arrayContentDidChange: function(startIdx, removeAmt, addAmt) {
    if (!this.get('content.isEmberTableContent') || this.get('content.isCompleted')) {
      this._super(startIdx, removeAmt, addAmt);
    }
  },
  //
  //sort: function(sortingColumns) {
  //  if (!this.get('content.isEmberTableContent')) {
  //    this.set('content', sortingColumns.sortContent(this.get('content')));
  //  } else {
  //    if (this.get('content.isCompleted')) {
  //      this.get('content').sort(sortingColumns);
  //    } else {
  //      this.get('content').set('sortingColumns', sortingColumns);
  //      this.get('content').resetContent();
  //    }
  //  }
  //},

  _isLastItem: function(idx) {
    return idx === this.get('length') - 1;
  }
});
