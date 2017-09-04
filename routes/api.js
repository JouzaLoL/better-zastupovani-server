'use strict';
const app = require('../app');
const express = require('express');

const supl = require('../lib/supl');

// Init routers
const API = express.Router();

API.get('/data', handleGETData);

function handleGETData(req, res, next) {

}