function handleError(err, req, res, next) {
	console.error(err.stack);
}

module.exports = handleError;