var _g = {};
$(document).ready(function () {
  initApp();
})

function initApp() {
  var cookie = $.cookie('_it-api');
  if (cookie) {
    access_token = cookie;
    makeTemplates();
    bindSettings();
    bindLeftPanel();
    $('.mainContainer .menus .menu[data-id="dashboard"]').trigger(eventToUse);
  } else {
    window.location.href = window.location.origin + '/dashboard-login';
  }
}

function bindSettings() {

}

function bindLeftPanel() {
  bind('.mainContainer .menus .menu', function () {
    var id = $(this).data('id');
    eval(id)({});
  })
}


function tracking() {
  console.log('--->>> Initializing Tracking');
  $.removeCookie('_it-api');
  window.location.href = window.location.origin + '/dashboard-login';
}

$.views.helpers({
  getToday: function () {
    return moment().format('MMMM DD,YYYY');
  }
})
