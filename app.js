
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , settings = require('./routes/settings')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dogecache');

var loginRoute = require('./routes/login');
var apiRoute = require('./routes/api');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/settings', settings.index);
app.get('/users', user.list);
app.get('/login', loginRoute.login);
app.get('/login/callback', loginRoute.loginCallback);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
