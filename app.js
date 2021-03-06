var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var user = require('./routes/user');
var file = require('./routes/file');
var article = require('./routes/article');
var filter = require('./utils/filter');
var admin = require('./routes/views');
var orm = require('orm');
var app = express();
var database = require('./models');
var log = require('./log4js_conf');
log.use(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);
app.use(session({
  secret:'leo',
  resave: false,
  saveUninitialized: true,
  cookie: {
    domain: '127.0.0.1',
    secure: false,
    path: '/',
    httpOnly: false
  }
}));



app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var ALLOW_ORIGINS = [
  'http://127.0.0.1:8888',
  'http://127.0.0.1:3001'
]
//解决跨域问题
app.all('*', function(req, res, next) {
  var origin = req.headers.origin;
  if(ALLOW_ORIGINS.indexOf(origin) >= 0){
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , Set-Cookie');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Content-Type','text/html;charset=UTF-8')
    next();
  } else {
    res.end('非法请求');
  }
});

app.use(database);
app.use(filter);
app.use('/', index);
app.use('/user', user);
app.use('/file', file);
app.use('/admin',admin);
app.use('/articles',article);

// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;

  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
