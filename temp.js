var session = require('express-session');

var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

var flash = require('express-flash');
var jwt = require('json-web-token');

var secretKey = "wj6aQMAclS"

var config = {};
config = require('./providers.json');

passportConfigurator.setupModels({
  userModel: app.models.User,
});

for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}



// app.middleware('auth', loopback.token({
//   model: app.models.AccessToken,
// }));

// app.middleware('session:before', cookieParser(app.get('cookieSecret')));
// app.middleware('session', session({
//   secret: 'kitty',
//   saveUninitialized: true,
//   resave: true,
// }));

// passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

app.get('/auth/account', ensureLoggedIn('/login'), function (req, res, next) {
  let payload = {
    name: req.user.profiles[0].profile.displayName,
    email: req.user.profiles[0].profile.emails[0].value,
  }
  jwt.encode(secretKey, payload, function (err, token) {
    res.redirect('https://it-support-team.herokuapp.com/auth/login_success/' + token)
  })
});

app.get('/auth/google', ensureLoggedIn('/login'), function (req, res, next) {
  res.send({
    user: req.user,
    url: req.url,
  });
});

app.get('/login', function (req, res, next) {
  res.send({
    user: req.user,
    url: req.url,
  });
});


app.post('/signup', function (req, res, next) {
  var User = app.models.user;

  var newUser = {};
  newUser.email = req.body.email.toLowerCase();
  newUser.username = req.body.username.trim();
  newUser.password = req.body.password;

  User.create(newUser, function (err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    } else {
      // Passport exposes a login() function on req (also aliased as logIn())
      // that can be used to establish a login session. This function is
      // primarily used when users sign up, during which req.login() can
      // be invoked to log in the newly registered user.
      req.login(user, function (err) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        return res.redirect('/auth/account');
      });
    }
  });
});

app.get('/auth/logout', function (req, res, next) {
  req.logout();
  // res.redirect('/');
  res.send({
    message: 'user logged out successfully'
  })
});



// {
//   "db": {
//     "host": "itasandbox-shard-00-00-51evd.mongodb.net:27017",
//     "port": 27017,
//     "url": "mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017,itasandbox-shard-00-01-51evd.mongodb.net:27017,itasandbox-shard-00-02-51evd.mongodb.net:27017/it-api?ssl=true&replicaSet=ITASandbox-shard-0&authSource=admin",
//     "database": "mongodb",
//     "password": "SilverBells2017$$",
//     "name": "db",
//     "user": "Justinkdeveloper",
//     "connector": "mongodb"
//   }
// }

