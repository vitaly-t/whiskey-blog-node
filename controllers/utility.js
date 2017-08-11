const express = require('express'),
      router = express.Router(),
      bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));


router.post('/markdown', function (req, res, next) {
  return res.render('../views/utility/markdown.twig', {
    markdownContent: req.body.markdownContent
  });
});


module.exports = router;
