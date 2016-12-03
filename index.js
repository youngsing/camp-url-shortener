var cool = require('cool-ascii-faces');
var express = require('express');
var crypto = require('crypto');

var app = express();

var outputRoot = '';
var collectionName = 'camp-short-url';

function parseIntputURL(url, res) {

	var hashedURL = crypto.createHash('sha1').update(url).digest('hex');

	console.log(hashedURL);
	res.send(hashedURL);
}

function handleNotFound(res) {
	res.status(404).send('Not Found  ' + cool());
}

function handleError(err, res) {
	handleNotFound(res);
	throw err;
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

function randomPath() {
	return randomInt(1000, 9999);
}

function validURL(url) {
	return /^(http|https):\/\/[^ "]+$/.test(url);
}

app.set('port', (process.env.PORT || 5000));

app.get('/new/:url*', function(req, res) {
	var url = req.params.url + req.params[0];
	if (url === undefined) {
		res.status(404).send('input param error  ' + cool());

	} else {
		if (validURL(url)) {
			outputRoot = req.headers.host + '/';
			parseIntputURL(url, res);
		} else {
			var result = {
				'error': 'wrong url format'
			}
			res.status(404).send(JSON.stringify(result));
		}
	}
});

app.get('/[0-9]+', function(req, res) {});

app.get('*', function(req, res) {
	handleNotFound(res);
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port ' + app.get('port'));
});
