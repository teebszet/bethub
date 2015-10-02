var express			= require('express');
var path			= require('path');
var favicon			= require('serve-favicon');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var formidable		= require('formidable');
var util			= require('util');

var fs				= require('fs');

var Baby			= require('babyparse');

var routes			= require('./routes/index');
var users			= require('./routes/users');

var app				= express();

// view engine setup
app.engine('liquid', require('express-liquid-node')());
app.set('view engine', 'liquid');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.render('sendfile');
});

app.post('/send-file', function (req, res) {

    // parse a file upload
    var form = new formidable.IncomingForm();

    form.uploadDir		= './uploads';
    form.keepExtensions	= true;

    form.parse(req, function(err, fields, files) {
	//	res.writeHead(200, {'content-type': 'text/plain'});
		res.writeHead(200, {'content-type': 'application/json'});
	//	res.write('received upload:\n\n');
	//	res.end(util.inspect({fields: fields, files: files}));


		console.log( files.inputData );

		if ( files.inputData.type === 'text/csv' ) {
			console.log( 'type is text/csv :)' );
			var filePath	= files.inputData.path;

			fs.readFile( filePath, function( err, data ) {

				if ( err ) { console.log(err); }
				//	data needs to be a string!!
				var parsed	= Baby.parse(  data + '', { dynamicTyping: true, header: true } );
				var rows	= parsed.data;

				console.log( 'parsed: ', parsed );
			});


		}


    });
	return;
  //	res.render('receivedfile');
});

/*
app.use('/', routes);
app.use('/users', users);
*/

// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
*/


module.exports = app;
