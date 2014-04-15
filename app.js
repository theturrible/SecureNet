/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var fs = require('fs');
var uuid = require('node-uuid');
var path = require('path');
var https = require('https');
var request = require('request');
var unirest = require('unirest');
var FormData = require('form-data');
/** 
 * Load controllers.
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var driveController = require('./controllers/drives');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: month }));

var csrf = express.csrf();
var bodyParser = express.bodyParser();

var conditionalCSRF = function (req, res, next) {
  console.log("CSRF Conditional");
  needsCSRF = true;

  debugger;

  if(req.path == "/parse") {
    needsCSRF = false;
  }

  req.needsCSRF = needsCSRF;


  if (needsCSRF) {
    console.log("CSRF Required");
    csrf(req, res, next);
  } else {
    //console.log("You, coo, you in. (da club, loon)");
    bodyParser(req, res, next);
  }
}

app.use(conditionalCSRF);
app.use(function(req, res, next) {
  res.locals.user = req.user;
  if(req.needsCSRF){
    console.log("CSRF Required Again");
    res.locals._csrf = req.csrfToken();
  }
  res.locals.secrets = secrets;
  next();
});

app.use(function(req, res, next) {
  // Keep track of previous URL
  if (req.method !== 'GET') return next();
  var path = req.path.split('/')[1];
  if (/(auth|login|logout|signup)$/i.test(path)) return next();
  req.session.returnTo = req.path;
  next( );
});
app.use(app.router);
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/*
WEBHook
*/
  app.post('/parse', function (req, res) {
    console.log("about to make a request");
    console.log("Parsing");
    //console.log(req);
    var from = req.body.from;
    var text = req.body.text;
    var subject = req.body.subject;
    var num_attachments = req.body.attachments;
    var attachments = [];
    console.log("Info",from,text,subject);
    console.log("attachments?", num_attachments);
    for (i = 1; i <= num_attachments; i++){
      var attachment = req.files['attachment' + i];
      attachments.push(attachment);
      console.log("got the attachment");
      console.log(attachment);
      // attachment will be a File object


      // upload here

      var headers = {
            'Authorization': 'ApiKey cmNybKpjmBMtKR34MvJ_g5UZJ_vYEJTdhqJQLW7_LfQGkPCB',
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
          };
      //     data = {
      //       "metadata" : JSON.stringify({"parent_id" : "fL3Vw", name: attachment.name})
      //     };

      // request({
      //   url: "https://api-kloudless-com-8b75ho2yxwzw.runscope.net/v0/accounts/49/files/?overwrite=true",
      //   method: "POST",
      //   headers: headers,
      //   form: data
      // }, function (error, response, body) {
      //     res.send(body);
      //     if (!error && response.statusCode == 200) {
      //         var info = JSON.parse(body);
      //     }
      // });

      unirest.post('https://api-kloudless-com-8b75ho2yxwzw.runscope.net/v0/accounts/49/files/?overwrite=true')
      .headers(headers)
      .field('metadata', JSON.stringify({"parent_id" : "fL3Vw", name: attachment.name})) // Form field
      .attach('file', attachment.path) // Attachment
      .end(function (response) {
        res.send(response.body);
      });



      var date = new Date();
      var pathToUploads = process.cwd() +  '/public/uploads/' ;
      var filename = date.toISOString() + uuid.v4() + path.extname(attachment.name); 
      var fullpath = pathToUploads + filename;


      console.log(filename);
      console.log(attachment.path);

      //rename
      fs.rename(attachment.path, fullpath, function (err, response) {
        if(err){
          console.log("Error", err);
        }
        console.log("moved");
      });

      // res.send(attachment);
   }
  });



/**
 * Application routes.
 */

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/api', apiController.getApi);
app.get('/drives', passportConf.isAuthenticated, driveController.getDrives);

app.get('/drives', function(req, res) {
  res.render("testing");
});

app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});



/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

module.exports = app;
