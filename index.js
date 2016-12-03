var cool = require('cool-ascii-faces');
var crypto = require('crypto');
var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();

var mongoPath = process.env.MONGOLAB_URI;

var outputRoot = '';
var collectionName = 'camp-short-url';

function parseIntputURL(url, res) {

	var hashedURL = crypto.createHash('sha1').update(url).digest('hex');

	mongo.connect(mongoPath, function(err, db) {

		if (err) {
			handleError(err, res);
			return;
		}

		var clt = db.collection(collectionName);
		clt.find({
			hash: hashedURL
		}, {
			origin: 1,
			output: 1,
			_id: 1
		}).toArray(function(err, docs) {
			if (err) {
				handleError(err, res);
				return;
			}

			if (docs.length === 0) {
				var codePath = randomPath();
				console.log('codePath', codePath);
				clt.insertOne({
					hash: hashedURL,
					origin: url,
					output: (outputRoot + codePath),
				}, function(err) {
					if (err) {
						handleError(err, res);
					} else {
						var result = {
							'original_url': url,
							'short_url': (outputRoot + codePath)
						}
						res.json(result);
						db.close();
					}
				});
			} else {
				var result = {
					'original_url': url,
					'short_url': docs[0].output
				}
				res.json(result);
				db.close();
			}

		});
	});

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

app.get('/[0-9]+', function(req, res) {
	mongo.connect(mongoPath, function(err, db) {
		if (err) {
			handleError(err, res);
			return;
		}

		var input = req.headers.host + req.path;
		var clt = db.collection(collectionName);
		clt.find({
			output: input
		}, {
			origin: 1
		}).toArray(function(err, docs) {
			if (err || docs.length === 0) {
				handleNotFound(res);
			} else {
				res.redirect(docs[0].origin);
			}
		});

	});
});

app.get('*', function(req, res) {
	handleNotFound(res);
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port ' + app.get('port'));
});
