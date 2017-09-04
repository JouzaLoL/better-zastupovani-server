'use strict';

const express = require('express');
var app = express();
module.exports = app;

// Middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

const cors = require('cors');
app.use(cors());

// Routes
const API = require('./routes/api');
app.use('/api/', API);

// Static files
app.use(express.statis('public'));

// Error handler
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log('Server started' + " | NODE_ENV: " + process.env);
});