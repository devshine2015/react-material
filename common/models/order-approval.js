'use strict';
var async = require('async');

module.exports = function (orderApproval) {
  orderApproval.beforeRemote('create', function (context, order_approval, next) {
    context.args.data.idkey = new Date().getTime();
    context.args.data.status_date_change = new Date();
    context.args.data.at = context.args.data.approved_at;
    context.args.data.nDay = parseInt(moment(context.args.data.approved_at).format('YYYYMMDD'));
    context.args.data.nMonth = parseInt(moment(context.args.data.approved_at).format('YYYYMM'));
    context.args.data.nYear = parseInt(moment(context.args.data.approved_at).format('YYYY'));
    context.args.data.nWeek = parseInt(moment(context.args.data.approved_at).isoWeek());
    context.args.data._raw = JSON.parse(context.args.data.contents);
    context.args.data.status = 'approved';
    console.log(JSON.parse(context.args.data.contents));

    // update file status in converted file objec and original file object
    updateOtherFilesInfoData(orderApproval, context.args.data._raw[0].request_no, 'approved');
    next();
  });

  orderApproval.afterRemote('create', function (context, order_approval, next) {
    var meta = processOrder(order_approval.contents);
    console.log(meta);
    var cc = context.args.data.company_id;
    var cn = context.arg.data.company_name;

    async.forEachSeries(meta, function (el, cb1) {
      el.order_metadata.company_id = cc;
      el.order_metadata.company_name = cn;
      orderApproval.app.models.order_metadata.create(el.order_metadata);
      el.order_information.forEach(function (el2) {
        el2.company_id = cc;
        el2.company_name = cn;
        orderApproval.app.models.order_information.create(el2);
      });
      async.forEachSeries(el.order_contents, function (c, cb) {
        c.company_id = cc;
        c.company_name = cn;
        orderApproval.app.models.order_contents.create(c, (err, c1) => {
          cb();
        })
      }, function () {
        cb1();
      })
    }, function () {
      context.result = {
        status: true
      }
      //sendMail('approved', context.args.data._raw[0].request_no);
      next();
    })
  });

  orderApproval.remoteMethod('reject_order', {
    http: {
      path: '/reject_order',
      verb: 'post'
    },
    return: {},
    accepts: [{
        arg: 'request_no',
        type: 'string',
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

  orderApproval.reject_order = function (request_no, res, cb) {
    updateOtherFilesInfoData(orderApproval, request_no, 'rejected');
    //sendMail('rejected', request_no);
    res.send(true);
  }
};

var moment = require('moment');
var generateHash = require('random-hash').generateHash;

function processOrder(_contents) {
  var contents = JSON.parse(_contents);
  var response = [];

  var at = new Date();
  contents.forEach(function (el, index) {
    var _o = {
      "order_metadata": {},
      "order_information": [],
      "order_contents": []
    };

    _o.order_metadata['idKey'] = generateHash({
      length: 16
    });
    _o.order_metadata['request_number'] = el.request_no;
    if (el.email_time && el.email_time != '')
      _o.order_metadata['email_time'] = moment(el.email_time, 'M/DD/YY h:mm a').toDate();
    _o.order_metadata['priority'] = el.priority;
    _o.order_metadata['project'] = el.project;
    _o.order_metadata['analyst'] = el.analyst;
    _o.order_metadata['status'] = el.status;
    _o.order_metadata['requestor'] = el.requestor;
    _o.order_metadata['phone'] = el.phone;
    if (el.submitted && el.submitted != '')
      _o.order_metadata['submitted_date'] = moment(el.submitted, 'MM/DD/YY').toDate();
    if (el.requested_due && el.requested_due != '')
      _o.order_metadata['requested_due_date'] = moment(el.requested_due, 'MM/DD/YY').toDate();
    if (el.confirmed_due && el.confirmed_due != '')
      _o.order_metadata['confirmed_due_date'] = moment(el.confirmed_due, 'MM/DD/YY').toDate();
    _o.order_metadata['agency_control'] = el.agency_control;
    _o.order_metadata['agency'] = el.agency;
    _o.order_metadata['order_type'] = el.order_type;
    _o.order_metadata['cost_center'] = el.cost_center;
    _o.order_metadata['request_description'] = el.request_description;
    _o.order_metadata['location_description'] = el.location_description;
    _o.order_metadata['tracking_number'] = el.tracking_number;
    _o.order_metadata['shipping_provider'] = el.shipping_provider;
    _o.order_metadata['orders'] = [];

    _o.order_metadata['at'] = at;
    _o.order_metadata['nDay'] = parseInt(moment(at).format('YYYYMMDD'));
    _o.order_metadata['nMonth'] = parseInt(moment(at).format('YYYYMM'));
    _o.order_metadata['nWeek'] = parseInt(moment(at).isoWeek());
    _o.order_metadata['nYear'] = parseInt(moment(at).format('YYYY'));

    el.orders.forEach(function (el1) {
      var orderInfo = getOrder(el1);
      orderInfo.status = 'pending';
      orderInfo['at'] = at;
      orderInfo['nDay'] = parseInt(moment(at).format('YYYYMMDD'));
      orderInfo['nMonth'] = parseInt(moment(at).format('YYYYMM'));
      orderInfo['nYear'] = parseInt(moment(at).format('YYYY'));
      orderInfo['nWeek'] = parseInt(moment(at).isoWeek());


      el1.line_items.forEach(function (el2) {
        var li = getLineItem(el2, orderInfo);

        li['at'] = at;
        li['nDay'] = parseInt(moment(at).format('YYYYMMDD'));
        li['nMonth'] = parseInt(moment(at).format('YYYYMM'));
        li['nYear'] = parseInt(moment(at).format('YYYY'));
        li['nWeek'] = parseInt(moment(at).isoWeek());

        li.idKey = generateHash({
          length: 16
        });
        orderInfo.line_items.push(li.idKey);
        _o.order_contents.push(li);
      })

      _o.order_metadata.orders.push(orderInfo.idKey);
      _o.order_information.push(orderInfo);
    });

    response.push(_o);
  });

  return response;
}


function getLineItem(_li, o) {
  var lineItem = {};

  lineItem['sr_number'] = o.sr_number;
  lineItem['inventory_number'] = o.inventory_number;
  lineItem['previous_inventory_number'] = o.previous_inventory_number;
  lineItem['action'] = _li.Action;
  lineItem['user_name'] = o.user_name;
  lineItem['description'] = _li.Description;
  lineItem['sku_code'] = _li.Description.includes('-') ? _li.Description.split('-')[_li.Description.split('-').length - 1].trim() : '';
  lineItem['rc_quantity'] = _li['RC Qty'];
  lineItem['rc_amount'] = 1 * _li['Rc Amt'].replace('$', '');
  lineItem['nrc_quantity'] = _li['NRC Qty'];
  lineItem['nrc_amount'] = 1 * _li['NRC Amt'].replace('$', '');
  lineItem['at'] = new Date();

  return lineItem;
}

function getOrder(el) {
  var orderInfo = {};
  orderInfo.idKey = generateHash({
    length: 16
  });
  orderInfo['request_number'] = el.request_no;
  orderInfo['action'] = el.action;
  orderInfo['inventory_number'] = el.inventory_no;
  orderInfo['previous_inventory_number'] = el.previous_inventory_no;
  orderInfo['user_name'] = el.user_name;
  orderInfo['cost_center'] = el.cost_center;
  orderInfo['cost_center_description'] = el.cost_center_description;
  orderInfo['vendor'] = el.vendor;
  orderInfo['sr_description'] = el.sr_description;
  orderInfo['comments'] = el.comments;
  if (el.requested_due_date && el.requested_due_date != '')
    orderInfo['requested_due_date'] = moment(el.requested_due_date, 'MM/DD/YY').toDate();
  if (el.confirmed_due_date && el.confirmed_due_date != '')
    orderInfo['confirmed_due_date'] = moment(el.confirmed_due_date, 'MM/DD/YY').toDate();
  orderInfo['billing_account_number'] = el.billing_account_number;
  orderInfo['equipment_model_number'] = el.equipment_model_no;
  orderInfo['primary_location'] = el.primary_secondary_location;
  orderInfo['secondary_location'] = el.primary_secondary_location;
  orderInfo['sr_number'] = el.sr_no;
  orderInfo['service'] = el.service;
  orderInfo['line_items'] = [];

  return orderInfo;
}

function updateOtherFilesInfoData(orderApproval, request_no, status) {
  orderApproval.getDataSource().connector.connect(function (err, db) {
    if (err) {
      console.log('Unable to get Data Source ');
      console.log(err);
    } else {
      var query = new RegExp([request_no].join(""), "i");
      db.collection('original_fileobject').update({
        "contents": query
      }, {
        "$set": {
          "status": status
        }
      }, {
        multi: true
      });

      db.collection('converted_fileobject').update({
        "contents": query
      }, {
        "$set": {
          "status": status
        }
      }, {
        multi: true
      });

      db.collection('converted_fileobject').find({
        "contents": query
      }).toArray(function (err, item) {
        if (err) {
          console.log(err);
        } else {
          if (item && item.length > 0) {
            console.log(item.length);
            var ids = [];
            item.forEach(function (el) {

              ids.push('' + el._id);
            });

            db.collection('fileobject').update({
              "converted_fileobject_id": {
                "$in": ids
              }
            }, {
              "$set": {
                "status": status
              }
            }, {
              multi: true
            })
          }
        }
      })
    }
  });

  function updateFileObject(id, db, status) {
    console.log(id + '  ->  ' + status);
    db.collection('fileobject').update({
      converted_fileobject_id: id
    }, {
      "$set": {
        "status": status
      }
    }, {
      multi: true
    }, function (err) {
      console.log(err);
    })
  }
}

 var email = require('../../modules/email')();

// function sendEmail(type, request_no) {
//   var message = 'Request with request number ' + request_no + ' has been ' + type.toUpperCase() + ' by ' + ' justin@gmail.com';
//   email.send({
//     subject: type == 'approved' ? 'Order Approved' : 'Order Rejected',
//     text: message,
//     to: 'sb@mail.com'
//   });
// }
