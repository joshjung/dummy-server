#!/usr/bin/env node
var debug = require('debug')('dummy-server');
var path = require('path');
var app = require('./express/app');

var specFile = path.resolve(__dirname, './test/spec/server.test.json');
var spec = require(specFile);

debug('Starting ' + spec.name);

app.set('port', process.env.PORT || spec.port);

app.initWithSpecification(spec, specFile);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});