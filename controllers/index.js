const express = require('express'),
      router = express.Router();

router.get('/', function (req, res) {
  res.send('<h1>You did it</h1>');
});

module.exports = router;
