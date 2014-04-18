
/**
 * Module dependencies.
 */

var express = require('express')
  , home = require('./routes/home')
  , map = require('./routes/map')
  , settings = require('./routes/settings')
  , stats = require('./routes/stats')
  , http = require('http')
  , path = require('path');

var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/dogecache');

var authRoute = require('./routes/auth');
var apiRoute = require('./routes/api');

var polldogebalances = require('./polldogebalances');
var config = require('./config');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.cookieParser(config.cookie_key));
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

//site is under construction?
if (config.maintenance == true || config.maintenance == "true") {
    app.get('/', function(req, res) {res.redirect('maintenance')});
    app.get('/maintenance', function(req, res) {res.render('maintenance', { title: 'Woops! | Dogecache', isMap: false, "maintenance_text": config.maintenance_text })})
    console.log("Site under construction.")
}
else
{
    //Setup main page routes
    app.get('/', home.index);
    app.get('/map', map.index);
    app.get('/settings', settings.index);
    app.get('/stats', stats.index);

    //Setup authentication routes
    app.get('/auth/facebook/login', authRoute.login_facebook);
    app.get('/auth/facebook/callback', authRoute.loginCallback_facebook);
    app.get('/auth/twitter/login', authRoute.login_twitter);
    app.get('/auth/twitter/callback', authRoute.loginCallback_twitter);
    app.get('/auth/google/login', authRoute.login_google);
    app.get('/auth/google/callback', authRoute.loginCallback_google);
    app.get('/auth/logout', authRoute.logout);

    //Setup api routes
    app.post('/api/cache', apiRoute.cache);
    app.post('/api/withdraw', apiRoute.withdraw);

    // TODO: check stack limits and memory usage of nested callbacks
    function poll() {
        setTimeout(function() {
            polldogebalances.poll(function(){
                poll();
            });
        }, 10000);
    }
    poll();
}


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

