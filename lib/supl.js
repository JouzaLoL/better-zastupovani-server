const cheerio = require('cheerio');
const fetch = require('node-fetch');
const moment = require('moment');
const array2d = require('array2d');
const parseTable = require('./cheerio-tableparser');

const URL_SUPL = 'http://suplovani.gytool.cz/';
const URL_ROZVRH = 'http://rozvrh.gytool.cz/index_Trida_Menu.html';
const URL_DATES = URL_SUPL + '!index_menu.html';

/**
 * Request wrapper that automatically decodes every request 
 * Encoding: windows-1250
 * @param {any} url 
 * @param {any} callback 
 */
function request(url, callback) {
	fetch(url).then((res) => {
		return res.text();
	}).then((body) => {
		let $ = cheerio.load(body, {
			decodeEntities: false
		});
		callback(null, null, body, $);
	});
}

function getClasses() {
	return new Promise((resolve, reject) => {
		request(URL_ROZVRH, (err, res, body, $) => {
			if (err) {
				reject(err);
			}
			let options = $('option');
			let values = options.map((i, option) => {
				return $(option).text();
			});
			let classes = values.toArray();
			resolve(classes);
		});
	});
}

function getDatesPage() {
	return new Promise((resolve, reject) => {
		request(URL_DATES, (err, res, body, $) => {
			if (err) {
				reject(err);
			}
			resolve(body);
		});
	});
}

function parseDatesPage(datesPage) {
	const $ = cheerio.load(datesPage);
	let options = $('option');
	let data = options.map((i, option) => {
		return {
			url: $(option).attr('value'),
			date: moment($(option).attr('value').slice(7, 17), 'YYYY/MM/DD')
		};
	});

	return data.toArray();
}

function getSuplovani(date) {
	return new Promise((resolve, reject) => {
		request(URL_SUPL + date.url, (err, res, body, $) => {
			if (err) {
				reject(err);
			}

			resolve(body);
		});
	});
}

function parseSuplovani(html) {
	const $ = cheerio.load(html);

	let result = {
		chybejici: [],
		suplovani: [],
		nahradniUcebny: []
	};

	let correctedChybejiciArray = parseTable($, $('div:contains("Chybějící")').next())[0].slice(1);
	correctedChybejiciArray.forEach((row) => {
		// Parse the string
		let parsedArray = row.split(', ');
		parsedArray.some((elem) => {
			let kdo = elem.split(' ')[0];
			// check if range is present
			if (!elem.includes(' ')) {
				result.chybejici.push(new ChybejiciRow(kdo, null));
				return true;
			}
			let rangePart = elem.split(' ')[1];
			let formatted = rangePart.replace('(', '').replace(')', '');
			let range = Array(2);
			// decide if range or only one hour: (1..2) or (2)
			if (formatted.length == 1) {
				// only one hour
				range = [formatted, formatted];
			} else {
				// range of hours
				let splitRange = formatted.split('..');
				range = [splitRange[0], splitRange[1]];
			}
			result.chybejici.push(new ChybejiciRow(kdo, range));
		});
	});

	let correctedSuplArray = array2d.transpose(parseTable($, $('div:contains("Suplování")').next())).slice(2);
	array2d.eachRow(correctedSuplArray, (row) => {
		result.suplovani.push(new SuplRow(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]));
	});

	let correctedNahradniUcebnyArray = array2d.transpose(parseTable($, $('div:contains("Náhradní")').next())).slice(2);
	array2d.eachRow(correctedNahradniUcebnyArray, (row) => {
		result.nahradniUcebny.push(new NahradniUcebnyRow(row[0], row[1], row[2], row[3], row[4], row[5], row[6]));
	});

	return result;
}

class ChybejiciRow {
	constructor(kdo, range) {
		this.kdo = kdo;
		this.range = range;
	}
}

class SuplRow {
	constructor(hodina, trida, predmet, ucebna, nahucebna, vyuc, zastup, pozn) {
		this.hodina = hodina;
		this.trida = trida;
		this.predmet = predmet;
		this.ucebna = ucebna;
		this.nahucebna = nahucebna;
		this.vyuc = vyuc;
		this.zastup = zastup;
		this.pozn = pozn;
	}
}

class NahradniUcebnyRow {
	constructor(hodina, trida, predmet, chybucebna, nahucebna, vyuc, pozn) {
		this.hodina = hodina;
		this.trida = trida;
		this.predmet = predmet;
		this.chybucebna = chybucebna;
		this.nahucebna = nahucebna;
		this.vyuc = vyuc;
		this.pozn = pozn;
	}
}

function getSuplovaniForAllDates() {
	return new Promise((resolve, reject) => {
		getDatesPage().then(datesPage => {
			const dates = parseDatesPage(datesPage);

			let promises = dates.map((date) => {
				return getSuplovani(date);
			});
			let allPromises = Promise.all(promises);
			allPromises.then((res) => {
				let result = res.map((supl) => {
					return Object.assign({}, supl.date, parseSuplovani(supl));
				});
				resolve(result);
			});
		});
	});
}

module.exports = { getClasses, getSuplovani, getDatesPage, parseDatesPage, parseSuplovani, ChybejiciRow, SuplRow, NahradniUcebnyRow, getSuplovaniForAllDates };