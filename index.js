//var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/new/:url', function(req, res) {
	var url = app.params.url;
	if (url === undefined) {
		res.send(404);
	} else {
		res.send(url);
	}
});

app.listen(app.get('port'), function () {
	console.log('Node app is running on port' + app.get('port'));
});
