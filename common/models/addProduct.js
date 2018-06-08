'use strict';

module.exports = function (addProduct) {
  addProduct.beforeRemote('create', function (context, order_approval, next) {
    context.args.data.idkey = new Date().getTime();
    context.args.data.at = new Date();
    addProduct.getDataSource().connector.connect(function (err, db) {
      var collection = db.collection('product');
      collection.find({}).sort({
        at: -1
      }).limit(1).toArray(function (err, item) {
        if (item && item.length > 0) {
          context.args.data.item_code = ++item[0].item_code;
        } else {
          context.args.data.item_code = 0;
        }
        next();
      })
    })
  })
};
