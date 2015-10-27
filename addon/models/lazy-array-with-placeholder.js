import Ember from 'ember';

export default Ember.ArrayProxy.extend({

  init: function () {
    this._super();
    this.set('content', Ember.A());
  },

  placeholder: null,

  load: null,

  // max array length
  totalCount: 1,

  itemClass: null,

  chunkSize: 1,

  // should be used by outer class which will know whether content changed or not.
  chunkDidLoad: Ember.K,

  objectAt: function (idx) {
    if (this.get('_contentLength') == idx) {
      this._invokeLoad(idx);
      return this.get('placeholder');
    }
    return this.get('content').objectAt(idx);
  },

  // lazy-array length
  length: Ember.computed('content.[]', 'totalCount', function () {
    return Math.min(this.get('_contentLength') + 1, this.get('totalCount'));
  }),

  isCompleted: Ember.computed('_contentLength', 'totalCount', function () {
    return this.get('_contentLength') === this.get('totalCount');
  }),

  /* ***********************************
   * private
   * *********************************** */

  _invokeLoad: function (idx) {
    let chunkIdx = this._calcChunkSize(idx);
    if (this.load) {
      this.load(chunkIdx).then((items) => {
        this.get('content').pushObjects(this._createItems(items));
        this.chunkDidLoad(items);
      });
    }
  },

  _createItems: function (contents) {
    var itemClass = this.get('itemClass');
    return (!itemClass || !contents) ? contents : contents.map((item) => itemClass.create(item));
  },

  _calcChunkSize: function (idx) {
    return Math.floor(idx / this.get('chunkSize'));
  },

  // only content length
  _contentLength: Ember.computed.oneWay('content.length')
});
