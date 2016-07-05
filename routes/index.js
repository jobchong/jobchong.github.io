var express = require('express');
var router = express.Router();

var alertvar = "I have been passed!"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { myVar: alertvar });
});

module.exports = router;
