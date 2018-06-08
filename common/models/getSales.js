'use strict';
var async = require('async');
var jsonexport = require('jsonexport');
var moment = require('moment');
var json2csv = require('json2csv');

module.exports = function (getSales) {
  getSales.remoteMethod('byMonth', {
    http: {
      path: '/byMonth',
      verb: 'post'
    },
    return: {},
    accepts: [{
        arg: 'nMonth',
        type: 'number',
        required: true
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ],
  });

  getSales.remoteMethod('getAccessoriesSales', {
    http: {
      path: '/getAccessoriesSales',
      verb: 'post'
    },
    return: {},
    accepts: [{
        arg: 'nMonth',
        type: 'number',
        required: true
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ],
  })

  getSales.remoteMethod('downloadCSV', {
    http: {
      path: '/downloadCSV/:month',
      verb: 'get'
    },
    return: {},
    accepts: [{
        arg: 'nMonth',
        type: 'number',
        required: true
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ],
  })

  getSales.remoteMethod('downloadAccessorySales', {
    http: {
      path: '/downloadAccessorySales/:month',
      verb: 'get'
    },
    return: {},
    accepts: [{
        arg: 'nMonth',
        type: 'number',
        required: true
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ],
  });

  getSales.remoteMethod('downloadDeviceSales', {
    http: {
      path: '/downloadDeviceSales/:month',
      verb: 'get'
    },
    return: {},
    accepts: [{
        arg: 'nMonth',
        type: 'number',
        required: true
      },
      {
        arg: 'res',
        type: 'object',
        'http': {
          source: 'res'
        }
      }
    ],
  })

  Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
  };

  getSales.downloadAccessorySales = function (nMonth, res, cb) {
    getSales.getDataSource().connector.connect(function (err, db) {
      db.collection('product').aggregate([{
        "$match": {
          "category": "accessory"
        }
      }, {
        "$group": {
          "_id": "",
          "codes": {
            "$push": "$sku"
          }
        }
      }], function (err, data) {
        var pipeline = [{
            "$project": {
              "_raw": 1,
              "at": 1,
              "nDay": 1,
              "nMonth": 1,
              "idkey": 1
            }
          },
          {
            "$unwind": "$_raw"
          },
          {
            "$unwind": "$_raw.orders"
          }, {
            "$unwind": "$_raw.orders.line_items"
          },
          {
            "$match": {
              "_raw.orders.line_items.sku_code": {
                "$in": data[0].codes
              }
            }
          }
        ];
        if (nMonth == 0) {
          {
            pipeline.insert(0, {
              "$match": {
                nMonth: {
                  "$gte": parseInt(moment().format('YYYYMM')) - 2
                }
              }
            })
          }
        } else if (nMonth == 1) {

        } else {
          pipeline.insert(0, {
            "$match": {
              nMonth: nMonth
            }
          })
        }
        var collection = db.collection('order_approval');
        collection.aggregate(pipeline, function (err, data) {
          if (err) {
            cb(err)
          } else {
            var result1 = [];
            var keylength = 0;
            var index;
            var i = 0;
            var nrcAmt_total = 0;
            var nrcQty_total = 0;
            var rcAmt_total = 0;
            var rcQty_total = 0;
            getProcessedOrders(function (_o) {
              async.forEachSeries(data, function (item, cb) {

                var k = 0;
                var el = item._raw;
                delete el._meta;
                el.at = moment(item.at).toDate().getTime();
                el.idKey = item.idkey;
                el.nDay = item.nDay;
                el.nMonth = item.nMonth;
                var _t = _o.find(function (el1) {
                  return el1 == el.orders.sr_no
                });
                if (_t) {
                  nrcAmt_total = nrcAmt_total + 1 * el.orders.line_items['NRC Amt'].replace('$', '');
                  rcAmt_total = rcAmt_total + 1 * el.orders.line_items['Rc Amt'].replace('$', '');

                  nrcQty_total = nrcQty_total + 1 * el.orders.line_items['NRC Qty'];
                  rcQty_total = rcQty_total + 1 * el.orders.line_items['RC Qty'];

                  k = k + Object.keys(el).length;
                  k = k + Object.keys(el.orders).length;
                  k = k + Object.keys(el.orders.line_items).length;
                  console.log(k);
                  if (k > keylength) {
                    keylength = k;
                    index = i;
                  }
                  result1.push(el);
                  i++;
                }
                cb();

              }, function () {

                var fields = [];
                var obj = result1[index];
                for (var key in obj) {
                  if (key != 'orders') {
                    fields.push(key);
                  } else {
                    for (var key1 in obj[key]) {
                      if (key1 != 'line_items') {
                        fields.push('orders.' + key1);
                      } else {
                        for (var key2 in obj[key][key1]) {
                          fields.push('orders.line_items.' + key2);
                        }
                      }
                    }
                  }
                };
                result1.push({
                  'request_no': 'Total',
                  'orders.line_items.RC Qty': rcQty_total,
                  'orders.line_items.Rc Amt': '$' + rcAmt_total,
                  'orders.line_items.NRC Qty': nrcQty_total,
                  'orders.line_items.NRC Amt': '$' + nrcAmt_total
                });
                json2csv({
                  data: result1,
                  fields: fields
                }, function (err, csv) {
                  //jsonexport(result1, function (err, csv) {
                  if (err) {
                    cb(err)
                  } else {
                    console.log(csv)
                    var dateTime = new Date()
                    res.set('Cache-Control', 'max-age=0, no-cache, must-revalidate, proxy-revalidate');
                    res.set('Last-Modified', dateTime + 'GMT');
                    res.set('Content-Type', 'application/force-download');
                    res.set('Content-Type', 'application/octet-stream');
                    res.set('Content-Type', 'application/download');
                    res.set('Content-Disposition', 'attachment;filename=Data.csv');
                    res.set('Content-Transfer-Encoding', 'binary');
                    res.send(csv);
                  }
                });
              });
            })
          }
        })
      })
    })
  }

  getSales.downloadDeviceSales = function (nMonth, res, cb) {
    getSales.getDataSource().connector.connect(function (err, db) {
      db.collection('product').aggregate([{
        "$match": {
          "category": "device"
        }
      }, {
        "$group": {
          "_id": "",
          "codes": {
            "$push": "$sku"
          }
        }
      }], function (err, data) {
        var pipeline = [{
            "$project": {
              "_raw": 1,
              "at": 1,
              "nDay": 1,
              "nMonth": 1,
              "idkey": 1
            }
          },
          {
            "$unwind": "$_raw"
          },
          {
            "$unwind": "$_raw.orders"
          }, {
            "$unwind": "$_raw.orders.line_items"
          },
          {
            "$match": {
              "_raw.orders.line_items.sku_code": {
                "$in": data[0].codes
              }
            }
          }
        ];
        if (nMonth == 0) {
          {
            pipeline.insert(0, {
              "$match": {
                nMonth: {
                  "$gte": parseInt(moment().format('YYYYMM')) - 2
                }
              }
            })
          }
        } else if (nMonth == 1) {

        } else {
          pipeline.insert(0, {
            "$match": {
              nMonth: nMonth
            }
          })
        }
        var collection = db.collection('order_approval');
        collection.aggregate(pipeline, function (err, data) {
          if (err) {
            cb(err)
          } else {
            var result1 = [];
            var keylength = 0;
            var index;
            var i = 0;
            var nrcAmt_total = 0;
            var nrcQty_total = 0;
            var rcAmt_total = 0;
            var rcQty_total = 0;
            getProcessedOrders(function (_o) {
              async.forEachSeries(data, function (item, cb) {

                var k = 0;
                var el = item._raw;
                delete el._meta;
                el.at = moment(item.at).toDate().getTime();
                el.idKey = item.idkey;
                el.nDay = item.nDay;
                el.nMonth = item.nMonth;
                var _t = _o.find(function (el1) {
                  return el1 == el.orders.sr_no
                });
                if (_t) {
                  nrcAmt_total = nrcAmt_total + 1 * el.orders.line_items['NRC Amt'].replace('$', '');
                  rcAmt_total = rcAmt_total + 1 * el.orders.line_items['Rc Amt'].replace('$', '');

                  nrcQty_total = nrcQty_total + 1 * el.orders.line_items['NRC Qty'];
                  rcQty_total = rcQty_total + 1 * el.orders.line_items['RC Qty'];

                  k = k + Object.keys(el).length;
                  k = k + Object.keys(el.orders).length;
                  k = k + Object.keys(el.orders.line_items).length;
                  console.log(k);
                  if (k > keylength) {
                    keylength = k;
                    index = i;
                  }
                  result1.push(el);
                  i++;
                }
                cb();

              }, function () {

                var fields = [];
                var obj = result1[index];
                for (var key in obj) {
                  if (key != 'orders') {
                    fields.push(key);
                  } else {
                    for (var key1 in obj[key]) {
                      if (key1 != 'line_items') {
                        fields.push('orders.' + key1);
                      } else {
                        for (var key2 in obj[key][key1]) {
                          fields.push('orders.line_items.' + key2);
                        }
                      }
                    }
                  }
                };
                result1.push({
                  'request_no': 'Total',
                  'orders.line_items.RC Qty': rcQty_total,
                  'orders.line_items.Rc Amt': '$' + rcAmt_total,
                  'orders.line_items.NRC Qty': nrcQty_total,
                  'orders.line_items.NRC Amt': '$' + nrcAmt_total
                });
                json2csv({
                  data: result1,
                  fields: fields
                }, function (err, csv) {
                  //jsonexport(result1, function (err, csv) {
                  if (err) {
                    cb(err)
                  } else {
                    console.log(csv)
                    var dateTime = new Date()
                    res.set('Cache-Control', 'max-age=0, no-cache, must-revalidate, proxy-revalidate');
                    res.set('Last-Modified', dateTime + 'GMT');
                    res.set('Content-Type', 'application/force-download');
                    res.set('Content-Type', 'application/octet-stream');
                    res.set('Content-Type', 'application/download');
                    res.set('Content-Disposition', 'attachment;filename=Data.csv');
                    res.set('Content-Transfer-Encoding', 'binary');
                    res.send(csv);
                  }
                });
              });
            })
          }
        })
      })
    })
  }

  getSales.downloadCSV = function (nMonth, res, cb) {
    getSales.getDataSource().connector.connect(function (err, db) {
      var pipeline = [{
          "$project": {
            "_raw": 1,
            "at": 1,
            "nDay": 1,
            "nMonth": 1,
            "idkey": 1
          }
        },
        {
          "$unwind": "$_raw"
        },
        {
          "$unwind": "$_raw.orders"
        }, {
          "$unwind": "$_raw.orders.line_items"
        }
      ];
      if (nMonth == 0) {
        {
          pipeline.insert(0, {
            "$match": {
              nMonth: {
                "$gte": parseInt(moment().format('YYYYMM')) - 2
              }
            }
          })
        }
      } else if (nMonth == 1) {

      } else {
        pipeline.insert(0, {
          "$match": {
            nMonth: nMonth
          }
        })
      }
      var collection = db.collection('order_approval');
      collection.aggregate(pipeline, function (err, data) {
        if (err) {
          cb(err)
        } else {
          var result1 = [];
          var keylength = 0;
          var index;
          var i = 0;
          var nrcAmt_total = 0;
          var nrcQty_total = 0;
          var rcAmt_total = 0;
          var rcQty_total = 0;
          getProcessedOrders(function (_o) {
            async.forEachSeries(data, function (item, cb) {

              var k = 0;
              var el = item._raw;
              delete el._meta;
              el.at = moment(item.at).toDate().getTime();
              el.idKey = item.idkey;
              el.nDay = item.nDay;
              el.nMonth = item.nMonth;
              var _t = _o.find(function (el1) {
                return el1 == el.orders.sr_no
              });
              if (_t) {
                nrcAmt_total = nrcAmt_total + 1 * el.orders.line_items['NRC Amt'].replace('$', '');
                rcAmt_total = rcAmt_total + 1 * el.orders.line_items['Rc Amt'].replace('$', '');

                nrcQty_total = nrcQty_total + 1 * el.orders.line_items['NRC Qty'];
                rcQty_total = rcQty_total + 1 * el.orders.line_items['RC Qty'];

                k = k + Object.keys(el).length;
                k = k + Object.keys(el.orders).length;
                k = k + Object.keys(el.orders.line_items).length;
                console.log(k);
                if (k > keylength) {
                  keylength = k;
                  index = i;
                }
                result1.push(el);
                i++;
              }
              cb();

            }, function () {

              var fields = [];
              var obj = result1[index];
              for (var key in obj) {
                if (key != 'orders') {
                  fields.push(key);
                } else {
                  for (var key1 in obj[key]) {
                    if (key1 != 'line_items') {
                      fields.push('orders.' + key1);
                    } else {
                      for (var key2 in obj[key][key1]) {
                        fields.push('orders.line_items.' + key2);
                      }
                    }
                  }
                }
              };
              result1.push({
                'request_no': 'Total',
                'orders.line_items.RC Qty': rcQty_total,
                'orders.line_items.Rc Amt': '$' + rcAmt_total,
                'orders.line_items.NRC Qty': nrcQty_total,
                'orders.line_items.NRC Amt': '$' + nrcAmt_total
              });
              json2csv({
                data: result1,
                fields: fields
              }, function (err, csv) {
                //jsonexport(result1, function (err, csv) {
                if (err) {
                  cb(err)
                } else {
                  console.log(csv)
                  var dateTime = new Date()
                  res.set('Cache-Control', 'max-age=0, no-cache, must-revalidate, proxy-revalidate');
                  res.set('Last-Modified', dateTime + 'GMT');
                  res.set('Content-Type', 'application/force-download');
                  res.set('Content-Type', 'application/octet-stream');
                  res.set('Content-Type', 'application/download');
                  res.set('Content-Disposition', 'attachment;filename=Data.csv');
                  res.set('Content-Transfer-Encoding', 'binary');
                  res.send(csv);
                }
              });
            });
          })
        }
      })
    })
  }


  getSales.byMonth = function (nMonth, res, cb) {
    console.log('--> ' + nMonth);
    var obj = {};

    getSales.getDataSource().connector.connect(function (err, db) {

      var reqArray = [];

      // calculating total number of orders
      reqArray.push(function (callback) {
        var collection = db.collection('order_information');
        collection.aggregate([{
            "$match": {
              "nMonth": nMonth
            }
          }, {
            "$group": {
              "_id": "",
              "count": {
                "$sum": 1
              }
            }
          }],
          function (err, data) {
            if (err) {

            } else {
              if (data.length > 0)
                obj['orders_count'] = data[0].count;
              else
                obj['orders_count'] = 0;
              callback();
            }
          })
      })

      // calculating total rc and nrc

      reqArray.push(function (callback) {
        var collection = db.collection('order_contents');
        collection.aggregate([{
            "$match": {
              "nMonth": nMonth
            }
          }, {
            "$group": {
              "_id": "",
              "total_rc_amount": {
                "$sum": "$rc_amount"
              },
              "total_rc_quantity": {
                "$sum": "$rc_quantity"
              },
              "total_nrc_amount": {
                "$sum": "$nrc_amount"
              },
              "total_nrc_quantity": {
                "$sum": "$nrc_quantity"
              }
            }
          }],
          function (err, data) {
            if (err) {

            } else {
              if (data.length > 0) {
                obj['total_rc_amount'] = data[0].total_rc_amount;
                obj['total_rc_quantity'] = data[0].total_rc_quantity;
                obj['total_nrc_amount'] = data[0].total_nrc_amount;
                obj['total_nrc_quantity'] = data[0].total_nrc_quantity;
              } else {
                obj['total_rc_amount'] = 0;
                obj['total_rc_quantity'] = 0;
                obj['total_nrc_amount'] = 0;
                obj['total_nrc_quantity'] = 0;
              }
              callback();
            }
          })
      })


      async.parallel(reqArray, function (err, result) {
        if (err) {
          res.json({
            status: 0,
            err: 'Unable to get Data'
          })
        } else {
          res.json(obj);
        }
      })
    })
  }


  getSales.getAccessoriesSales = function (nMonth, res, cb) {
    console.log('--> ' + nMonth);
    var obj = {};
    getSales.getDataSource().connector.connect(function (err, db) {
      var collection = db.collection('product');
      collection.aggregate([{
        "$group": {
          "_id": "$sku"
        }
      }, {
        "$group": {
          "_id": "",
          "sku_codes": {
            "$push": "$_id"
          }
        }
      }], function (err, data) {
        if (data && data.length > 0) {
          var collection = db.collection('order_contents');
          collection.aggregate([{
              "$match": {
                "nMonth": nMonth,
                "sku_code": {
                  "$in": data[0].sku_codes
                }
              }
            }, {
              "$group": {
                "_id": "",
                "total_rc_amount": {
                  "$sum": "$rc_amount"
                },
                "total_rc_quantity": {
                  "$sum": "$rc_quantity"
                },
                "total_nrc_amount": {
                  "$sum": "$nrc_amount"
                },
                "total_nrc_quantity": {
                  "$sum": "$nrc_quantity"
                }
              }
            }],
            function (err, data) {
              if (err) {

              } else {
                if (data.length > 0) {
                  obj['total_rc_amount'] = data[0].total_rc_amount;
                  obj['total_rc_quantity'] = data[0].total_rc_quantity;
                  obj['total_nrc_amount'] = data[0].total_nrc_amount;
                  obj['total_nrc_quantity'] = data[0].total_nrc_quantity;
                } else {
                  obj['total_rc_amount'] = 0;
                  obj['total_rc_quantity'] = 0;
                  obj['total_nrc_amount'] = 0;
                  obj['total_nrc_quantity'] = 0;
                }

                res.json(obj);
              }
            })
        } else {
          res.json({
            status: false,
            err: 'No Products'
          });
        }
      })
    })
  }
}

var db = require('../../server/db')();

//getProcessedOrders();

function getProcessedOrders(cb) {
  var options = db.getQueryObj({
    db: 'it-api',
    mongoUrl: 'mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/',
    collection: 'order_information',
    q: {
      status: 'processed'
    },
    p: {
      "sr_number": 1
    }
  });

  db.findData(options, function (r1) {
    console.log(r1);
    var a = [];
    r1.forEach(function (el) {
      a.push(el.sr_number);
    });

    cb(a);
  })
}
