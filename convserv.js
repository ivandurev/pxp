var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended:true,limit: '5mb'}));
var img = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "03102000pxpdupla",
	database: "pxp"
});
app.get('/:name', function (req, res)
{
	res.sendfile(req.params.name);
});
app.get('/images/:name', function (req, res)
{
	res.sendfile('images/'+req.params.name);
});
app.post('/saveImage', function(req, res)
{
	img.query("INSERT INTO images (dat) VALUES('"+req.body.data+"');", function(err,rows)
	{
		//console.log("INSERT INTO keywords (dat) VALUES("+req.body.data+");");
  		if(err) throw err;
  		res.send({id:rows.insertId});
	});
});
app.post('/addKeyword', function(req, res)
{
	console.log(req.body);
	img.query("INSERT INTO keywords (word, imgid, times, bulgarian) VALUES ('"+req.body.word+"',"+req.body.image+","+req.body.times+",'"+req.body.bulgarian+"');", function(err, rows)
	{
		if(err) throw err;
		console.log("Keyword data saved");
	});
});
img.connect(function(err)
{
	if(err) console.log("Error connecting to image and keyword database");
	else
	{
		console.log("Image and keyword database connected");
	}
});
app.listen(2999, function ()
{
  console.log('App listening on port 2999!')
});