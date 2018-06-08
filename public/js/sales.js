var _search;
var _currentOrder;

function sales() {
  console.log('--->>> Initializing Sales');
  $('.mainContainer .dashboard .header').html('All Orders<span class="sub-text">View all Sales</span>');
  $('.mainContainer .menus .menu .text i.active').removeClass('active');
  $('[data-id=sales] i').addClass('active');
  loader('s', 'Please wait while Sales is loading data...');
  var form_data1 = new FormData();
  form_data1.append('keyword', '*');
  $.ajax({
    type: "POST",
    url: appUrl + 'api/get_orders/byKeyword?access_token=' + access_token,
    data: $.param({
      keyword: '*'
    }),
    processData: false,
    contentType: "application/x-www-form-urlencoded",
    timeout: 0, // in milliseconds
    success: success,
    error: loader('e')
  });

  function success(_d) {
    _g.orders = _d;
    console.log(_d);
    showUI(_d);
    getOrderTypes(_d);
    bindExport();
  }

  function showUI(_d, key) {
    console.log(_d);
    rb('.dashboard', 'sales', {
      d: _d
    }, '', '.order .col.col-5', function (el, data) {
      showOrderDetail(data);
    });
    if (_search != '' && _search != undefined)
      $('.mainContainer .dashboard .allOrdersContainer .searchArea .inputArea .inputArea-1').val(_search);

    if (key) {
      $('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .text').text(key.toUpperCase());
    }
    bind('.mainContainer .dashboard .allOrdersContainer .searchArea .searchButton', function () {
      var val = $('.mainContainer .dashboard .allOrdersContainer .searchArea .inputArea .inputArea-1').val().trim();
      _search = val;
      loader('s', 'Searching...');
      if (val == '')
        val = '*';
      $.ajax({
        type: "POST",
        url: appUrl + 'api/get_orders/byKeyword?access_token=' + access_token,
        data: $.param({
          keyword: val
        }),
        processData: false,
        contentType: "application/x-www-form-urlencoded",
        timeout: 0, // in milliseconds
        success: done,
        error: loader('e')
      });

      function done(d) {
        _g.orders = d;
        showUI(d);
        getOrderTypes(d);
        bindExport();
      }
    })
  }

  function getOrderTypes(d) {
    var o = {};
    d.forEach(function (el) {
      o[el._raw.order_type] = 1;
    });

    var a = [{
      key: 'all'
    }, {
      key: 'pending'
    }, {
      key: 'processed'
    }];

    // for (var key in o) {
    //   if (key != undefined && key != 'undefined')
    //     a.push({
    //       key: key
    //     });
    // }

    _g.oTypes = a;
    console.log(a);
    render('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .dropdown', 'dropdown', a);
    bind('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .dropdownButton', function () {
      $('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .dropdown').show();
      bind('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .dropdown .list', function () {
        var data = ($.view(this).data);
        $('.mainContainer .dashboard .allOrdersContainer .searchArea .filter .dropdown').hide();
        if (data.key == 'all')
          showUI(_g.orders);
        else if (data.key == 'pending' || data.key == 'processed') {
          console.log(data.key);
          var temp = _g.orders.filter(function (el) {
            return data.key == el.detailedOrderInfo[0].status
          });
          if (temp == undefined)
            temp = [];
          console.log(temp.length + ' Orders');
          showUI(temp, data.key);
        } else {
          var temp = _g.orders.filter(function (el) {
            return data.key.toLowerCase() == JSON.parse(JSON.stringify(el))._raw.order_type.toLowerCase();
          });

          if (temp == undefined)
            temp = [];
          showUI(temp);
        }
        getOrderTypes(_g.orders);
      })
    })
  }
}

function bindExport() {
  bind('.mainContainer .dashboard .allOrdersContainer .export', function () {
    window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + 1 + '?access_token=' + access_token);
  })
}


function showOrderDetail(data) {
  console.log(data);
  // loader('s', 'Please wait while Order is loading data...');
  // $.ajax({
  //   type: "POST",
  //   url: appUrl + 'api/get_orders/byKeyword?access_token=' + access_token,
  //   data: $.param({
  //     keyword: '{single}' + data._raw.request_no
  //   }),
  //   processData: false,
  //   contentType: "application/x-www-form-urlencoded",
  //   timeout: 0, // in milliseconds
  //   success: renderSingleOrder,
  //   error: loader('e')
  // });

  renderSingleOrder(data);
}


function renderSingleOrder(data) {

  _currentOrder = data;
  delete data._raw._meta;
  data._raw._meta = data.detailedOrderInfo[0].meta_data || {};
  console.log(data._raw._meta);
  console.log(data._raw);
  render('.dashboard', 'orderDetail', data._raw);
  var line_items = [];
  data._raw.orders.line_items.forEach(function (el) {
    var o = JSON.parse(JSON.stringify(data._raw.orders));
    delete o.line_items;
    el.rca = el['Rc Amt'];
    el.rcq = el['RC Qty'];
    el.nrca = el['NRC Amt'];
    el.nrcq = el['NRC Qty'];
    el.orders = o;
    line_items.push(el);
  })
  render('.mainContainer .dashboard .orderDetailContainer .line-items', 'order-detail-li', {
    line_items: line_items
  });

  bind('.mainContainer .dashboard .orderDetailContainer .line-items .line-item .li .row-2.rca', function () {
    console.log('RC -> ' + $(this).data('index'));
    var index = $(this).data('index');
    var ref = this;
    var originalValue = $(this).text().replace('RC AMT:', '').trim();
    showPopUp('rc-input')
      .then(function (r) {
        if (r) {
          console.log(r);

          showPopUp('approve')
            .then(function (r1) {
              if (r1) {
                console.log(r1);
                $.notify('Updating Order...', 'info');
                execute('updatePrice', {
                  index: index,
                  order: _currentOrder,
                  newVal: '$' + r.val,
                  type: 'rc',
                  user: r1,
                  at: new Date(),
                  originalValue : originalValue
                }, function (r2) {
                  if (r2) {
                    $.notify('Order Updated', 'info');
                    $(ref).html('RC AMT: $' + r.val + ' <img src="../images/edit.png" class="edit-icon">');
                  } else {
                    $.notify('Update Failed...', 'error');
                  }
                })
              }
            })
        }
      })
  });

  bind('.mainContainer .dashboard .orderDetailContainer .line-items .line-item .li .row-2.nrca', function () {
    console.log('NRC -> ' + $(this).data('index'));
    var index = $(this).data('index');
    var ref = this;
    var originalValue = $(this).text().replace('NRC AMT:', '').trim();
    showPopUp('nrc-input')
      .then(function (r) {
        if (r) {
          console.log(r);

          showPopUp('approve')
            .then(function (r1) {
              if (r1) {
                console.log(r1);
                $.notify('Updating Order...', 'info');
                execute('updatePrice', {
                  index: index,
                  order: _currentOrder,
                  newVal: '$' + r.val,
                  type: 'nrc',
                  user: r1,
                  at: new Date(),
                  originalValue : originalValue
                }, function (r2) {
                  if (r2) {
                    $.notify('Order Updated', 'info');
                    $(ref).html('NRC AMT: $' + r.val + ' <img src="../images/edit.png" class="edit-icon">');
                  } else {
                    $.notify('Update Failed...', 'error');
                  }
                })
              }
            })
        }
      })
  })
}

$.views.helpers({
  getLinrItemCal: function (data) {
    var o = {};
    var rcq = 0,
      rca = 0,
      nrcq = 0,
      nrca = 0;

    data.forEach(function (el) {
      rcq = rcq + 1 * el['RC Qty'];
      rca = (rca + 1 * el['Rc Amt'].replace('$', ''));
      nrcq = nrcq + 1 * el['NRC Qty'];
      nrca = (nrca + 1 * el['NRC Amt'].replace('$', ''))
    });


    return {
      rcq: rcq,
      rca: '$' + rca.toFixed(2),
      nrca: '$' + nrca.toFixed(2),
      nrcq: nrcq
    }
  },
  getMeta: function (meta) {
    var arr = [];
    console.log(meta);
    for (var key in meta) {

    }
  }
});
