var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var uen = "uen";
var db;

// var companiesHouse = require('companies-house')('dhokmSz0Kxz0LOMVRmhAo4x1Fxlcdh0oAGBxnUSd');
// var fs = require('fs');

mongodb.MongoClient.connect("mongodb://localhost:27017/test", function (err, database) {
    if (err) {
	console.log(err);
	process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");
});

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);

var router = express.Router();              // get an instance of the express Router

router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


router.route("/company/uen/:id")
    .get(function(req, res) {
	db.collection(uen).findOne({ UEN: req.params.id }, function(err, doc) {
	    if (err) {
		handleError(res, err.message, "Failed to get contact");
	    } else {
		res.status(200).json(doc);
	    }
	});
    });

router.route("/company/:id")
    .get(function(req, res) {
	var request = req.params.id;
	var re = new RegExp(request, "i", "g"); 
	db.collection(uen).findOne({ ENTITY_NAME: {$regex : re}}, function(err, doc) {
	    if (err) {
		handleError(res, err.message, "Failed to get contact");
	    } else {
		res.status(200).json(doc);
	    }
	});
    });


app.use('/api', router);


// companiesHouse.search('certsimple', function(err, res) {
//     fs.writeFile('message.txt', JSON.stringify(res), (err) => {
// 	if (err) throw err;
// 	console.log(res);
//     });
// });




// catch 404 and forward to error handler
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


module.exports = app;
