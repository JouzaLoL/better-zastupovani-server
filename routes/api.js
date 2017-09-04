'use strict';
const express = require('express');

const supl = require('../lib/supl');

// Init routers
const API = express.Router();

API.get('/data', handleGETData);

function handleGETData(req, res, next) {
	Promise
		.all([supl.getClasses(), supl.getSuplovaniForAllDates()])
		.then((data) => {
			res.json({
				classes: data[0],
				suplovani: data[1]
			});
		}, next);
}

module.exports = API;