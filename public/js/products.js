//
//
//
var category;

function products() {
  console.log('--->>> Initializing Products');
  $('.mainContainer .menus .menu .text i.active').removeClass('active');
  $('[data-id=products] i').addClass('active');
  $('.addProductContainer').hide();
  loader('s', 'Please wait while Products are loading...');
  $.ajax({
    type: "GET",
    url: appUrl + 'api/products' + '?access_token=' + access_token,
    data: {},
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    timeout: 1000000, // in milliseconds
    success: renderProducts,
    error: function () {
      loader('e', 'No Products');
    }
  });

  $.ajax({
    type: "GET",
    url: appUrl + 'api/categories' + '?access_token=' + access_token,
    data: {},
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    timeout: 1000000, // in milliseconds
    success: function (r) {
      category = r;
    },
    error: function () {
      loader('e', 'No Products');
    }
  });
}

function renderProducts(p) {
  p.forEach(function (el) {
    el.nickname = el.nickname.toString();
  })
  render('.dashboard', 'product', {
    d: p
  });

  bind('.product-delete', function () {
    var _p = $.view(this).data
    console.log(_p);
    $.notify('Pleasw wait...', 'info');
    $.ajax({
      type: "PATCH",
      url: appUrl + 'api/products/' + _p.id + '?access_token=' + access_token,
      data: JSON.stringify({
        "isActive": 0
      }),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      timeout: 1000000, // in milliseconds
      success: products,
      error: function () {

      }
    });
  })

  bind('.product-edit', function () {
    var _p = $.view(this).data
    console.log(_p);
    var data = _p;
    data.categories = category;
    _p.nickname = _p.nickname.toString();
    data.categories.forEach(function (element) {
      if (element.category_code == _p.category_code) {
        element.class = "selected";
      }
    });

    var _s;
    render('.addProductContainer', 'addProduct', data);
    $('.addProductContainer').show();
    bind('.mainContainer .addProductContainer .pop-up .p-row.c', function () {
      _s = $.view(this).data;
      console.log(_s);
      $('.mainContainer .addProductContainer .pop-up .p-row.c .check').removeClass('selected');
      $(this).find('.check').addClass('selected');
    });

    bind('.mainContainer .addProductContainer .pop-up .p-row.save', function () {
      var obj = _p;
      obj.name = $('.mainContainer .addProductContainer .pop-up .p-row.name').val();
      obj.sku = $('.mainContainer .addProductContainer .pop-up .p-row.code').val();
      obj.nickname = $('.mainContainer .addProductContainer .pop-up .p-row.nname').val().split(',').map(function(el){return el.trim()});

      if (_s) {
        obj.category_code = _s.category_code;
        obj.category = _s.name;
      }

      console.log(obj);
      delete obj.categories;

      $(this).text('Please Wait..');

      $.ajax({
        type: "PATCH",
        url: appUrl + 'api/products/' + _p.id + '?access_token=' + access_token,
        data: JSON.stringify(obj),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 1000000, // in milliseconds
        success: products,
        error: function () {

        }
      });

    })
  
    bind('.mainContainer .addProductContainer, .mainContainer .menus', function (event) {
      if($('.mainContainer .addProductContainer .pop-up').css('display') === 'block'){
        $('.addProductContainer').hide();
      } else {
        event.stopPropagation();
      }
    });
  
    bind('.mainContainer .addProductContainer .pop-up', function () {
      event.stopPropagation();
    })
    
    bind('.mainContainer .addProductContainer .pop-up .p-row.cancel', function () {
      $('.addProductContainer').hide();
    })
  });

  bind('.product-add', function () {
    var data = {};
    data.categories = category;
    var _s;
    render('.addProductContainer', 'addProduct', data);
    $('.addProductContainer').show();
    bind('.mainContainer .addProductContainer .pop-up .p-row.c', function () {
      _s = $.view(this).data;
      console.log(_s);
      $('.mainContainer .addProductContainer .pop-up .p-row.c .check').removeClass('selected');
      $(this).find('.check').addClass('selected');
    });

    bind('.mainContainer .addProductContainer .pop-up .p-row.save', function () {
      var obj = {
        "name": "string",
        "sku": "string",
        "category_code": 0,
        "category": "string",
        "idkey": "string",
        "company_name": "string",
        "company_id": "string",
        "nickname": "string",
        "isActive": 1
      };

      obj.name = $('.mainContainer .addProductContainer .pop-up .p-row.name').val();
      obj.sku = $('.mainContainer .addProductContainer .pop-up .p-row.code').val();
      obj.nickname = $('.mainContainer .addProductContainer .pop-up .p-row.nname').val().split(',').map(function(el){return el.trim()});
      if (_s) {
        obj.category_code = _s.category_code;
        obj.category = _s.name;
      }

      console.log(obj);

      $(this).text('Please Wait..');

      $.ajax({
        type: "POST",
        url: appUrl + 'api/products' + '?access_token=' + access_token,
        data: JSON.stringify(obj),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        timeout: 1000000, // in milliseconds
        success: products,
        error: function () {

        }
      });

    })
  
    bind('.mainContainer .addProductContainer, .mainContainer .menus', function (event) {
      if($('.mainContainer .addProductContainer .pop-up').css('display') === 'block'){
        $('.addProductContainer').hide();
      } else {
        event.stopPropagation();
      }
    });
  
    bind('.mainContainer .addProductContainer .pop-up', function () {
      event.stopPropagation();
    })
    
    bind('.mainContainer .addProductContainer .pop-up .p-row.cancel', function () {
      $('.addProductContainer').hide();
    })
  })
}
