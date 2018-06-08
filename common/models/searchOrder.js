module.exports = function (searchOrder) {

  searchOrder.remoteMethod('byKeyword', {
    http: {
      path: '/byKeyword',
      verb: 'post'
    },
    return: {},
    accepts: [{
        arg: 'keyword',
        type: 'string',
        required: false
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ]
  });

  searchOrder.byKeyword = function (keyword, res, cb) {
    console.log('get order by keyword --> ' + keyword);
    searchOrder.getDataSource().connector.connect(function (err, db) {
      var collection = db.collection('order_approval');
      var query = {};
      if (keyword != '*')
        query['contents'] = new RegExp([keyword].join(""), "i");
      if (keyword.includes('{single}'))
        query['contents'] = new RegExp([keyword.replace('{single}', '')].join(""), "i");
      var project = {
        "_raw.request_no": 1,
        "_raw.email_time": 1,
        "_raw.requestor": 1,
        "_raw.orders.action": 1,
        "_raw.orders.sr_no": 1,
        "_raw.order_type": 1
      }

      if (keyword.includes('{single}')) {
        collection.find(query, {
            _raw: 1
          }).sort({
            approved_at: -1
          })
          .toArray(function (err, item) {
            if (err) {
              res.send(false);
            } else {
              console.log(item);
              var orders = [];
              item.forEach(function (element) {
                element._raw.forEach(function (el) {
                  delete el._meta;
                  orders.push(el);
                })
              });

              res.send(orders);
            }
          })
      } else {
        var pipeline = [{
            "$match": query
          },
          {
            "$sort": {
              approved_at: -1
            }
          },
          {
            "$unwind": "$_raw"
          },
          {
            "$unwind": "$_raw.orders"
          }, {
            "$lookup": {
              "from": "order_information",
              "localField": "_raw.orders.sr_no",
              "foreignField": "sr_number",
              "as": "detailedOrderInfo"
            }
          }
        ];

        collection.aggregate(pipeline, function (err, data) {
          res.send(data);
        })
      }
    })
  }
}
