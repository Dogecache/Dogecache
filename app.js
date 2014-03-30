
/**
 * Module dependencies.
 */

var express = require('express')
  , home = require('./routes/home')
  , map = require('./routes/map')
  , settings = require('./routes/settings')
  , stats = require('./routes/stats')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/dogecache');

var authRoute = require('./routes/auth');
var apiRoute = require('./routes/api');

var polldogebalances = require('./polldogebalances');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.cookieParser('uu*Sw*9&A4h1*UaA85z1xFL1iFpT4l'));
  app.use(express.session());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
    process.on('uncaughtException', function(err) {
        // handle the error safely
        console.log(err);
    });
});

app.get('/', home.index);
app.get('/map', map.index);
app.get('/settings', settings.index);
app.get('/stats', stats.index);
app.get('/auth/login', authRoute.login);
app.get('/auth/callback', authRoute.loginCallback);
app.get('/auth/logout', authRoute.logout);
app.post('/api/cache', apiRoute.cache);
app.post('/api/withdraw', apiRoute.withdraw);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

setInterval(function() {
    polldogebalances.poll(function() {});
}, 10000);
