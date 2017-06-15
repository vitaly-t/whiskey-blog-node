const express = require('express');

let app = express();

// pass-through static directory
app.use(express.static('public'));

// load all controllers
app.use(require('./controllers'));

// fire it up
app.listen(3000, function () {
    console.log('Listening on localhost port 3000');
});
