module.exports = () => {
  var db = require('../server/db')();
  var ObjectId = require('mongodb').ObjectID;

  function update(req, res) {
    var r = req.body;
    var request_no = r.order._raw.orders.request_no;
    var sr_no = r.order._raw.orders.sr_no;
    console.log(r);
    var options = db.getQueryObj({
      db: 'it-api',
      mongoUrl: 'mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/',
      collection: 'order_information',
      q: {
        sr_number: sr_no,
        request_number: request_no
      }
    });

    db.findOne(options, function (r1) {
      if (r1) {

        r1.isPriceUpdated = 1;
        r1.approver = r.user;
        if (r1['isRCUpdated'] == undefined || r1['isRCUpdated'] == 0)
          r1['isRCUpdated'] = r.type == 'rc' ? 1 : 0;
        if (r1['isNRCUpdated'] == undefined || r1['isNRCUpdated'] == 0)
          r1['isNRCUpdated'] = r.type == 'nrc' ? 1 : 0;

        if (r1['priceUpdateLog'] == undefined)
          r1['priceUpdateLog'] = [];
        r1['priceUpdateLog'].push({
          amount_old: 1 * r.originalValue.replace('$', ''),
          amout_new: 1 * r.newVal.replace('$', ''),
          type: r.type,
          approver: r.user,
          at: new Date(r.at)
        });

        r1.updatedAt = new Date(r.at);
        r1._id = new ObjectId(r1._id);
        options.options.query = r1;
        db.saveData(options);

        // update line items

        var line_item_id = r1.line_items[r.index];
        console.log(line_item_id);
        var obj = {};
        if (r.type == 'rc') {
          obj['rc_amount'] = 1 * r.newVal.replace('$', '');
          obj['isRCUpdated'] = 1;
        } else {
          obj['nrc_amount'] = 1 * r.newVal.replace('$', '');
          obj['isNRCUpdated'] = 1;
        }
        var options1 = db.getQueryObj({
          db: 'it-api',
          mongoUrl: 'mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/',
          collection: 'order_contents',
          q: {
            findQuery: {
              idKey: line_item_id
            },
            setQuery: {
              "$set": obj
            }
          }
        });

        db.updateData(options1);

        // update order approval
        console.log(r.order.idkey);
        var options2 = db.getQueryObj({
          db: 'it-api',
          mongoUrl: 'mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/',
          collection: 'order_approval',
          q: {
            idkey: r.order.idkey
          }
        });

        db.findOne(options2, function (r3) {
          if (r3) {
            r3._raw[0].orders.forEach(function (r1) {
              if (r1.request_no == request_no && r1.sr_no == sr_no) {
                r1.isPriceUpdated = 1;
                r1.approver = r.user;
                if (r1['isRCUpdated'] == undefined || r1['isRCUpdated'] == 0)
                  r1['isRCUpdated'] = r.type == 'rc' ? 1 : 0;
                if (r1['isNRCUpdated'] == undefined || r1['isNRCUpdated'] == 0)
                  r1['isNRCUpdated'] = r.type == 'nrc' ? 1 : 0;
                r1.updatedAt = new Date(r.at);

                if (r.type == 'rc') {
                  r1.line_items[r.index]['isRCUpdated'] = 1;
                  r1.line_items[r.index]['Rc Amt'] = r.newVal;
                } else {
                  r1.line_items[r.index]['isNRCUpdated'] = 1;
                  r1.line_items[r.index]['NRC Amt'] = r.newVal;
                }
              }
            });
            r3._id = new ObjectId(r3._id);
            options2.options.query = r3;
            db.saveData(options2);
          }
        });

        res.send(true);
      } else {
        res.send(false);
      }
    })
  }
  return {
    update: update
  }
}
