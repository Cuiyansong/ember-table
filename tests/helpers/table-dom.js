import Ember from 'ember';

var TableDom = Ember.ObjectProxy.extend({

  parent: null,

  aliasMethods: ['find', 'eq', 'click', 'text', 'has'],

  length: Ember.computed.oneWay('content.length'),

  init: function() {
    var self = this;
    self.aliasMethods.forEach(function (methodName) {
      self.defineMethod(methodName);
    });
    this._super();
  },

  defineMethod: function(name) {
    this.set(name, function () {
      var content = this.get('content');
      return content[name].apply(content, arguments);
    });
  },

  headerRows: function(idx) {
    var selector = idx === undefined ? '' : ':eq(' + idx + ')';
    var dom = this.find('.ember-table-header-block').find('.ember-table-table-row' + selector);
    return this.createChildDom(dom);
  },

  headerRow: function(idx) {
    var dom = this.headerRows().eq(idx);
    return this.createChildDom(dom);
  },

  rows: function(idx) {
    var selector = idx === undefined ? '' : ':eq(' + idx + ')';
    var dom = this.find('.ember-table-table-block.lazy-list-container').find('.ember-table-table-row' + selector);
    return this.createChildDom(dom);
  },

  row: function(idx) {
    var dom = this.rows().eq(idx);
    return this.createChildDom(dom);
  },

  cellsContent: function(rows, cols) {
    var self = this;
    return rows.map(function(rIdx) {
      return cols.map(function(cIdx) {
        return self.cell(rIdx, cIdx).text().trim();
      });
    });
  },

  groupIndicator: function() {
    var dom = this.find('.grouping-column-indicator:has(div)');
    return this.createChildDom(dom);
  },

  cells: function(){
    var dom = this.find('.ember-table-cell');
    return this.createChildDom(dom);
  },

  cell: function() {
    var parent = arguments.length === 1 ? this : this.rows(arguments[0]);
    var dom = parent.cells().eq(arguments[arguments.length - 1]);
    return this.createChildDom(dom);
  },

  createChildDom: function(dom) {
    return TableDom.create({
      content: dom,
      parent: this
    });
  }
});

export default TableDom;
