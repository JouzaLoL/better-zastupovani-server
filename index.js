'use strict';

const express = require('express');
var app = express();
module.exports = app;

// Middleware
const cors = require('cors');
app.use(cors());

// Logging
const morgan = require('morgan');
app.use(morgan('tiny'));

// Routes
const API = require('./routes/api');
app.use('/api/', API);

// Static files
app.use(express.static('public'));

// Error handler
const errorHandler = require('./error');
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`better-zastupovani-server started | Environment: ${process.env.NODE_ENV}`);
});