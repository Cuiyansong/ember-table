import Ember from 'ember';

var DataProvider = function(options) {
  options = options || {};

  this.columnName = options.columnName;

  var toQuery = function(obj) {
    var keys = Object.keys(obj).sort();
    return keys.map(function (key) {
      return key + '=' + obj[key];
    }).join('&');
  };

  var makeJsonArray = function(arr, baseNum) {
    baseNum = baseNum || 0;
    return arr.map(function (i) {
      return {
        id: i + baseNum,
        name: 'name-' + i,
        activity: 'activity-' + (i%2),
        state: 'state-' + (11 - i),
        accountType: 'at-' + (i + baseNum),
        accountCode: 'ac-' + (i + baseNum),
        accountSection: 'as-' + (i + baseNum)
      };
    });
  };
  var sortDataMap = Ember.Object.create();
  var items = [
    ['chunkIndex=0', [1, 2, 3, 4, 5], 0],
    ['chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 0],
    ['chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity', [2, 4, 6, 8, 10], 0],
    ['chunkIndex=0&sortDirect[0]=desc&sortName[0]=activity', [1, 3, 5, 7, 9], 0],
    ['chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 0],
    ['chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 0],
    ['chunkIndex=0&sortDirect[0]=asc&sortName[0]=accountSection', [1, 2, 3, 4, 5], 0],
    ['chunkIndex=1&sortDirect[0]=asc&sortName[0]=accountSection', [6, 7, 8, 9, 10], 0],
    ['chunkIndex=0&sortDirect[0]=desc&sortName[0]=accountSection', [10, 9, 8, 7, 6], 0],
    ['chunkIndex=1&sortDirect[0]=desc&sortName[0]=accountSection', [5, 4, 3, 2, 1], 0],
    ['chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity&sortDirect[1]=asc&sortName[1]=state', [10, 8, 6, 4, 2], 0],
    ['chunkIndex=0&sortDirect[0]=desc&sortName[0]=activity&sortDirect[1]=asc&sortName[1]=state', [9, 7, 5, 3, 1], 0],
    ['chunkIndex=0&sortDirect[0]=desc&sortName[0]=activity&sortDirect[1]=desc&sortName[1]=state', [1, 3, 5, 7, 9], 0],
    ['chunkIndex=1', [6, 7, 8, 9, 10], 0],
    ['accountSection=1&chunkIndex=0', [2, 1, 5, 4, 3], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=accountType', [10, 9, 8, 7, 6], 100],
    ['accountSection=1&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 100],
    ['accountSection=1&chunkIndex=1&sortDirect[0]=desc&sortName[0]=accountType', [5, 4, 3, 2, 1], 100],
    ['accountSection=1&accountType=101&chunkIndex=0', [1, 2, 3, 4, 5], 1000],
    ['accountSection=1&accountType=102&chunkIndex=0', [3, 5, 1, 2, 4], 1000],
    ['accountSection=1&accountType=102&chunkIndex=1', [7, 9, 10, 6, 8], 1000],
    ['accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 1000],
    ['accountSection=1&accountType=102&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 1000],
    ['accountSection=1&chunkIndex=1', [8, 7, 9, 10, 6], 100],
    ['accountSection=10&chunkIndex=0', [3, 4, 5, 1, 2], 100],
    ['accountSection=10&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 100],
    ['accountSection=10&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 100],
    ['accountSection=10&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 100],
    ['accountSection=2&chunkIndex=0', [1, 2, 3, 4, 5], 200],
    ['accountSection=2&accountType=201&chunkIndex=0', [1, 2, 3, 4, 5], 2000],
    ['accountSection=2&accountType=202&chunkIndex=0', [1, 2, 3, 4, 5], 2000],
    ['accountSection=3&chunkIndex=0', [3, 4, 5, 1, 2], 300],
    ['accountSection=3&chunkIndex=1', [8, 9, 10, 6, 7], 300],
    ['accountSection=3&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 300],
    ['accountSection=3&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 300],
    ['accountSection=8&chunkIndex=0&sortDirect[0]=desc&sortName[0]=id', [10, 9, 8, 7, 6], 800],
    ['accountSection=8&chunkIndex=1&sortDirect[0]=desc&sortName[0]=id', [5, 4, 3, 2, 1], 800],
    ['accountSection=8&chunkIndex=0', [3, 4, 5, 1, 2], 800],
    ['accountSection=3&chunkIndex=1&sortDirect[0]=asc&sortName[0]=id', [6, 7, 8, 9, 10], 300],
    ['accountSection=3&chunkIndex=0&sortDirect[0]=asc&sortName[0]=id', [1, 2, 3, 4, 5], 300],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity', [2, 4, 6, 8, 10], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=activity', [1, 3, 5, 7, 9], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=asc&sortName[0]=activity&sortDirect[1]=asc&sortName[1]=state',
      [10, 8, 6, 4, 2], 100],
    ['accountSection=1&chunkIndex=0&sortDirect[0]=desc&sortName[0]=activity&sortDirect[1]=desc&sortName[1]=state',
      [1, 3, 5, 7, 9], 100]
  ];
  items.forEach(function(item) {
    sortDataMap.set(item[0], function () {
      return makeJsonArray(item[1], item[2]);
    });
  });
  this.sortData = function (chunkIndex, sortingColumns, groupingMetadata, groupQuery) {
    var queryObj = {};
    (groupQuery.paths || []).forEach(function(x) {
      queryObj[x.name] = x.value;
    });
    Ember.setProperties(queryObj, {chunkIndex: chunkIndex});
    var isSortByGrouper = groupQuery.grouperKey && groupQuery.grouperSortDirection;
    if (isSortByGrouper) {
      queryObj['sortName[0]'] = groupQuery.grouperKey;
      queryObj['sortDirect[0]'] = groupQuery.grouperSortDirection;
    }
    var theQueryString = toQuery(queryObj);
    if(!isSortByGrouper && sortingColumns && sortingColumns.get('isNotEmpty')) {
      theQueryString += "&" + sortingColumns.map(function (column, index) {
          return "sortDirect[%@]=%@&sortName[%@]=%@".fmt(
            index, column.get("sortDirect"), index, column.get("contentPath"));
        }).join("&");
    }
    //console.log('query', theQueryString);
    return sortDataMap.get(theQueryString)();
  };
};

var delayResolve = function(defer, result, time){
  if (time > 0) {
    setTimeout(function(){
      defer.resolve(result);
    }, time);
  } else {
    defer.resolve(result);
  }
};

export default Ember.Object.extend({
  loadChunkCount: 0,
  defers: null,
  columnName: 'Column1',
  totalCount: 10,
  chunkSize: 5,
  delayTime: 0,
  loadTotalRow: Ember.computed(function () {
    var defer = this.get('defers').next();
    defer.resolve({id: 'grand total'});
    return defer.promise;
  }),
  hasTotalRow: false,
  load: Ember.computed(function() {
    let self = this;
    let defers = this.get('defers');
    let groupingMetadata = this.get('groupingMetadata');
    let chunkSize = this.get('chunkSize');
    let totalCount = this.get('totalCount');
    let delayTime = this.get('delayTime');
    return (chunkIndex, sortingColumns, groupQuery) => {
      var dataProvider = new DataProvider({columnName: self.get('columnName')});
      var defer = defers.next();
      var content = dataProvider.sortData(chunkIndex, sortingColumns, groupingMetadata, groupQuery);
      var result = {
        content: content.slice(0, chunkSize),
        meta: {totalCount, chunkSize}
      };
      delayResolve(defer, result, delayTime);
      self.incrementProperty('loadChunkCount');
      return defer.promise;
    };
  }),
  groupingMetadata: null,
  grandTotalTitle: null
});
