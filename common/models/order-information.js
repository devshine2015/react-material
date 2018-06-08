'use strict';

module.exports = function (Orderinformation) {
  Orderinformation.afterRemote('**', function (context, order_informations, next) {

    if (context.methodString.includes('patch')) {
      Orderinformation.getDataSource().connector.connect(function (err, db) {
        if (err) {
          console.log('Unable to update Status');
        } else {
          console.log(order_informations.idKey);
          db.collection('order_information').update({
            "idKey": order_informations.idKey
          }, {
            "$set": {
              "status": "processed"
            }
          })
        }
      })
    }
    next();
  });
}
