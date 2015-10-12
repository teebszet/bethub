var express			= require('express');
//	var debug			= require('node-inspector');
//	var mongoose		= require('mongoose');
var path			= require('path');
var favicon			= require('serve-favicon');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
//var bodyParser		= require('body-parser');
// var formidable		= require('formidable');
var util			= require('util');

// var fs				= require('fs');

// var Baby			= require('babyparse');

var routes			= require('./api/router');

var app				= express();

// view engine setup
app.engine('liquid', require('express-liquid-node')());
app.set('view engine', 'liquid');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);


module.exports = app;
