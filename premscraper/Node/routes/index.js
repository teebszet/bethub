var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

engine
  .parseAndRender("hi {{name}}", { name: "tobi" })
  .then(function(result) { console.log(result) });
});

module.exports = router;
