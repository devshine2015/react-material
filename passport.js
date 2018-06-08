module.exports = (app) => {
  /*************************************************************/
  // GOOGLE LOGIN
  var passport = require('passport');
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var jwt = require('json-web-token');
  var secretKey = "wj6aQMAclS"

  app.use(require('express-session')({
    secret: 'kitty',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  var config = {};
  config = require('./server/providers.json');

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });


  passport.deserializeUser(function (id, done) {
    app.models.User.find({
      where: {
        id: id
      }
    }, function (err, user) {
      done(err, user[0]);
    });
  });

  passport.use(new GoogleStrategy({

    clientID: config['google-auth'].clientID,
    clientSecret: config['google-auth'].clientSecret,
    callbackURL: config['google-auth'].callbackURL,

  }, function (token, refreshToken, profile, done) {

    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function () {

      // try to find the user based on their google id
      app.models.User.find({
          where: {
            google_id: profile.id
          }
        },
        function (err, user) {
          if (err)
            return done(err);

          if (user && user.length > 0) {

            // if a user is found, log them in
            return done(null, user[0]);
          } else {
            // if the user isnt in our database, create a new user
            var newUser = {};

            // set all of the relevant information
            newUser.google_id = profile.id;
            newUser.google_token = token;
            newUser.google_refresh_token = refreshToken;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.password = '1q2w3edsaqwer';
            newUser.username = profile.id;
            // save the user
            app.models.User.create(newUser, function (err, u) {
              if (err)
                throw err;
              return done(null, u);
            });
          }
        })
    });

  }));


  app.get('/auth/google', passport.authenticate('google', {
    scope: config['google-auth'].scope
  }));

  app.get('/auth/google/callback',
    passport.authenticate('google'),
    function (req, res) {
      console.log(req.user);
      app.models.User.login({
        email: req.user.email,
        password: '1q2w3edsaqwer'
      }, 'User', function (err, token) {
        if (err) {
          res.send('Unable to login');
        } else {
          let payload = {
            name: req.user.name,
            email: req.user.email,
          };
          jwt.encode(secretKey, payload, function (err, t) {
            res.redirect('https://it-support-team.herokuapp.com/auth/login_success/' + t + '?token=' + token.id);
          })
        }
      })
    });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }


  app.get('/login', isLoggedIn, function (req, res) {
    res.send({
      user: req.user,
      url: req.url,
    });
  });

  // route for logging out
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

}
