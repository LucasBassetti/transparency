var express = require('express'),
	bodyParser = require('body-parser'),
	app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.get('/', function(req, res) {
// 	res.send('working');
// });

app.use('/loa', require('./routes/api'))

app.listen(3000);

console.log('API is running on port 3000');
