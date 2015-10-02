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