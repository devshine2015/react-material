var db = require('../server/db')();
var async = require('async')

module.exports = () => {

  function get(req, res) {
    var r = req.body;
    var reqArray = [];
    var quries = ['totalSales^order_information', 'accessorySales^order_information', 'devicesales^order_information', 'newST^order_information', 'upgradeST^order_information', 'accressoryST^order_information', 'users^order_information'];
    //, 'newST', 'upgradeST', 'accressoryST', 'users'
    var result = {};

    quries.forEach(function (el) {
      reqArray.push(function (callback) {
        var options = db.getQueryObj({
          db: 'it-api',
          mongoUrl: 'mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/',
          collection: el.split('^')[1],
          q: {
            pipeline: aggregates[el.split('^')[0]]
          }
        });

        db.getAgrregatedData(options, function (r1) {
          result[el.split('^')[0]] = r1;
          callback();
        })
      })
    });

    async.parallel(reqArray, function (err, result_raw) {
      res.json(result);
    })
  }

  var moment = require('moment');
  var aggregates = {};
  aggregates['totalSales'] = [{
      "$match": {
        "nYear": parseInt(moment().format('YYYY')),
        "status": "processed"
      }
    }, {
      "$unwind": "$line_items"
    },
    {
      "$lookup": {
        "from": "order_contents",
        "localField": "line_items",
        "foreignField": "idKey",
        "as": "order_contents"
      }
    },
    {
      "$unwind": "$order_contents"
    },
    {
      "$group": {
        "_id": "$nWeek",
        "rc": {
          "$sum": "$order_contents.rc_amount"
        },
        "nrc": {
          "$sum": "$order_contents.nrc_amount"
        }
      }
    }
  ];

  aggregates['accessorySales'] = [
    // Stage 1
    {
      $match: {
        "nYear": parseInt(moment().format('YYYY')),
        "status": "processed"
      }
    },

    // Stage 2
    {
      $unwind: "$line_items"
    },

    // Stage 3
    {
      $lookup: {
        from: "product",
        localField: "sku_code",
        foreignField: "sku",
        as: "categories"
      }
    },

    // Stage 4
    {
      $unwind: "$categories"
    },

    // Stage 5
    {
      $match: {
        "categories.category": "accessory"
      }
    },

    // Stage 6
    {
      $lookup: {
        "from": "order_contents",
        "localField": "line_items",
        "foreignField": "idKey",
        "as": "order_contents"
      }
    },

    // Stage 7
    {
      $unwind: "$order_contents"
    },

    // Stage 8
    {
      $group: {
        "_id": "$nWeek",
        "rc": {
          "$sum": "$order_contents.rc_amount"
        },
        "nrc": {
          "$sum": "$order_contents.nrc_amount"
        }
      }
    },

  ];

  aggregates['devicesales'] = [
    // Stage 1
    {
      $match: {
        "nYear": parseInt(moment().format('YYYY')),
        "status": "processed"
      }
    },

    // Stage 2
    {
      $unwind: "$line_items"
    },

    // Stage 3
    {
      $lookup: {
        from: "product",
        localField: "sku_code",
        foreignField: "sku",
        as: "categories"
      }
    },

    // Stage 4
    {
      $unwind: "$categories"
    },

    // Stage 5
    {
      $match: {
        "categories.category": "device"
      }
    },

    // Stage 6
    {
      $lookup: {
        "from": "order_contents",
        "localField": "line_items",
        "foreignField": "idKey",
        "as": "order_contents"
      }
    },

    // Stage 7
    {
      $unwind: "$order_contents"
    },

    // Stage 8
    {
      $group: {
        "_id": "$nWeek",
        "rc": {
          "$sum": "$order_contents.rc_amount"
        },
        "nrc": {
          "$sum": "$order_contents.nrc_amount"
        }
      }
    },

  ];

  aggregates['newST'] = [{
    "$match": {
      "nMonth": {
        "$gte": (parseInt(moment().format('YYYYMM')) - 1)
      },
      "action": "Add",
      "status": "processed"
    }
  }, {
    "$group": {
      "_id": "$nMonth",
      "total": {
        "$sum": 1
      }
    }
  }];

  aggregates['upgradeST'] = [{
    "$match": {
      "nMonth": {
        "$gte": (parseInt(moment().format('YYYYMM')) - 1)
      },
      "action": "Upgrades",
      "status": "processed"
    }
  }, {
    "$group": {
      "_id": "$nMonth",
      "total": {
        "$sum": 1
      }
    }
  }]

  aggregates['accressoryST'] = [{
    "$match": {
      "nMonth": {
        "$gte": (parseInt(moment().format('YYYYMM')) - 1)
      },
      "status": "processed",
      "action": "TBD"
    }
  }, {
    "$group": {
      "_id": "$nMonth",
      "total": {
        "$sum": 1
      }
    }
  }];

  aggregates['users'] = [
    // Stage 1
    {
      $match: {
        "nMonth": parseInt(moment().format('YYYYMM')),
        "status": "processed"
      }
    },

    // Stage 2
    {
      $lookup: {
        "from": "order_metadata",
        "localField": "request_number",
        "foreignField": "request_number",
        "as": "order_metadata"
      }
    },

    // Stage 3
    {
      $unwind: "$line_items"
    },

    // Stage 4
    {
      $lookup: {
        "from": "order_contents",
        "localField": "line_items",
        "foreignField": "idKey",
        "as": "order_contents"
      }
    },

    // Stage 5
    {
      $unwind: "$order_metadata"
    },

    // Stage 6
    {
      $unwind: "$order_contents"
    },

    // Stage 7
    {
      $group: {
        "_id": "$order_metadata.phone",
        "requestor": {
          "$first": "$order_metadata.requestor"
        },
        "nWeek": {
          "$first": "$nWeek"
        },
        "rc": {
          "$push": "$order_contents.rc_amount"
        },
        "nrc": {
          "$push": "$order_contents.nrc_amount"
        }
      }
    },

  ];

  return {
    get: get
  }
}
