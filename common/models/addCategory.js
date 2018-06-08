'use strict';

module.exports = function (addCategory) {
  addCategory.beforeRemote('create', function (context, order_approval, next) {
    context.args.data.idkey = new Date().getTime();
    context.args.data.at = new Date();
    addCategory.getDataSource().connector.connect(function (err, db) {
      var collection = db.collection('category');
      collection.find({}).sort({
        at: -1
      }).limit(1).toArray(function (err, item) {
        if (item && item.length > 0) {
          context.args.data.category_code = ++item[0].category_code;
        } else {
          context.args.data.category_code = 0;
        }
        next();
      })
    })
  })
};
