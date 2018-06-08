'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var bodyParser = require('body-parser');

var app = module.exports = loopback();

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});


/******************************************************/
// OWN SERVER
var path = require('path');


app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

app.use(loopback.static(path.resolve(__dirname, '../public')));

app.get('/dash', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../public/views/index.html'));
})

// Dashboard page
app.get('/dashboard', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../public/views/dashboard.html'));
})


//test purpose
app.get('/dashboard-login', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../public/views/login.html'));
});


var db = require('./db')();
var async = require('async');


app.get('/it-api-css', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../it-api.css'));
})

app.get('/it-api-screen-css', function (req, res) {
  res.sendFile(path.resolve(__dirname, '../screen.css'));
})


// API TO GET DASHBOARD DATA IN ONE REQUEST
var _gdd = require('../modules/getDashboardData')();
app.post('/getDashboardData', _gdd.get);

var _ddr = require('../modules/downloadDetailedReport')();
app.get('/downloadDetailedReport', _ddr.get);


var _p = require('../passport')(app);

var _uOrder = require('../modules/updatePrice')();
app.post('/updatePrice', _uOrder.update);
