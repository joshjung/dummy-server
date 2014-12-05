var dummy = require('dummy-data');
var express = require('express');
var debug = require('debug')('dummy-server');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.initWithSpecification = function(spec, specFile) {
  var router = express.Router();

  spec.requests.forEach(function (request) {
    var type = request.type ? request.type.toLowerCase() : 'get';
    router[type](request.path, requestHandlerGenerator(request, specFile));
  });

  app.use('/', router);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
  });
};

function requestHandlerGenerator(request, specFile) {
  debug('Mapping ' + request.type + ':\'' + request.path + '\' ==> ' + request.response.type);

  switch (request.response.type) {
    case "String":
      return function (req, res, next) {
        debug('STRING request: ' + req.url);
        res.send(request.response.value);
      };
    break;
    case "dummyJSON":
      return function (req, res, next) {
        debug('dummyJSON request: ' + req.url);

        var dir = path.dirname(specFile);
        var dummyDataSpecFile = path.resolve(dir, request.response.file);
        var dummyDataSpecFileObj = require(dummyDataSpecFile);

        var data = dummy.generate(dummyDataSpecFileObj);

        res.send(data);
      };
    break;
  }

  throw Error('Could not find request.response.type where was ' + request.response.type)
};

module.exports = app;