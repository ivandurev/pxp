'use strict';
var express = require('express');
var http = require('http');  
var https = require('https');  
var bodyParser = require('body-parser');
var mysql = require('mysql');
var crypto = require('crypto');
//var HTTP_redirect = require('./HTTP_redirect');
var path = require('path');
var fs = require('fs');
var helmet = require('helmet');
//const readline = require('readline');
var app = express();
app.use(helmet());
app.use(helmet.noCache());
var img = mysql.createConnection({
	host: "127.0.0.1",
	user: "nane008",
	password: "03102000pxpdupla",
	database: "pxp",
	port: 4288
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
/*
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function commandLine()
{
	rl.question('>', function(answer)
	{
	  	eval(answer);
	  	rl.close();
		commandLine();
	});
}
*/
/*
process.stdin.setRawMode(true);
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});
process.stdin.on('readable', function () {
  var key = String(process.stdin.read());
  console.log(key.charCodeAt(0));
});
*/
var keyPath = 'letsencrypt/privkey.pem';  
var certPath = 'letsencrypt/cert.pem';  
var caPath = 'letsencrypt/fullchain.pem';
var credentials = {  
    key: fs.readFileSync(keyPath, 'utf8'),
   	cert: fs.readFileSync(certPath, 'utf8'),
    ca: fs.readFileSync(caPath, 'utf8'),
};

app.enable('trust proxy');
/*var webroot = 'letsencrypt';  
var webrootPath = '/.well-known/acme-challenge';
var app = express();  
app.use(webrootPath, express.static(webroot + webrootPath));  
app.use (function (req, res, next)
{
    if (req.secure) next();
    else res.redirect('https://' + req.headers.host + req.url);
});*/
app.get('/favicon.ico', function(req, res)
{
	res.sendFile(path.join(__dirname, 'favicon.ico'));
});
app.get('/game.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'game.html'));
});
app.get('/game.js', function(req, res)
{
	res.sendFile(path.join(__dirname, 'game.js'));
});
app.get('/index.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/user.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'user.html'));
});

app.get('/help.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'help.html'));
});
app.get('/leaderbord.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'leaderbord.html'));
});

app.get('/game.css', function(req, res)
{
	res.sendFile(path.join(__dirname, 'game.css'));
});
app.get('/index.css', function(req, res)
{
	res.sendFile(path.join(__dirname, 'index.css'));
});

app.get('/settings.html', function(req, res)
{
	res.sendFile(path.join(__dirname, 'settings.html'));
});
app.get('/', function(req, res)
{
	res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/jquery.min.js', function(req, res)
{
	res.sendFile(path.join(__dirname, 'jquery.min.js'));
});
app.get('/index.js', function(req, res)
{
	res.sendFile(path.join(__dirname, 'index.js'));
});
app.get('/bootstrap.min.css', function(req, res)
{
	res.sendFile(path.join(__dirname, 'bootstrap.min.css'));
});
app.get('/colours/:name', function (req, res)
{
	res.sendFile(path.join(__dirname, 'colours/'+req.params.name));
});
var images = []; // images from db;
var imgid = []; // image id from db to match in keywords;
var users = [], ul = 0; // users info and length
var token = []; // token to user match
var name = []; // user to username
var userid = [];//user to id
var multiplier = 9; //how many times to multiply word points

var check = function(str)
{
	var letters = /^[0-9a-zA-Zа-яА-Я]+$/;
	if(str.match(letters)) return 1;
	return 0;
}
var genToken = function()
{
	return genRandomString(20);
	//DEPRECATED
	var tk = "";
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
	for(var i = 0; i < 20; i ++)
	{
		tk += letters[Math.floor(Math.random()*letters.length)];
	}
	return tk;
}

var genRandomString = function(length)
{
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex') .slice(0,length); 
};
var sha256 = function(password, salt)
{
    var hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function register(user, pass)
{
    var salt = genRandomString(16);
    var password = sha256(pass, salt);
    img.query("INSERT INTO users (username, points, salt, pass, imgopen, lang) VALUES ('"+user+"',"+users[userid[user]].points+",'"+salt+"','"+password.passwordHash+"',"+users[userid[user]].image+",'"+users[userid[user]].lang+"')", function(err, rows)
    {
    	if(err) throw err;
    });
}
app.post('/register', function(req, res)
{
	if(req.body.token != undefined && req.body.user != undefined && req.body.pass != undefined && check(req.body.token) && check(req.body.user) && check(req.body.pass))
	{
		var tk = token[req.body.token];
		if(tk == undefined) return;
		if(req.body.user.length > 20)
		{
			res.send({valid:0});
			return;
		}
		img.query("SELECT * FROM users WHERE username='"+req.body.user+"'", function(err, rows)
		{
			if(err) throw err;
			if(rows.length == 0)
			{
				name[tk] = req.body.user;
				userid[name[tk]] = tk;
				register(req.body.user, req.body.pass);
				res.send({valid:1});
				return;
			}
			else res.send({valid:0});
		});
	}
	else res.send({valid:0});
});
app.post('/login', function(req, res)
{
	console.log(req.body);
	if(req.body.token != undefined && req.body.user != undefined && req.body.pass != undefined && check(req.body.token) && check(req.body.user) && check(req.body.pass))
	{
		var tk = token[req.body.token];
		if(tk == undefined) return;
		img.query("SELECT salt FROM users WHERE username='"+req.body.user+"'", function(err1, rows1)
		{
			if(err1) throw err1;
			if(rows1.length == 0) 
			{
				res.send({valid:0});
				return;
			}
			img.query("SELECT * FROM users WHERE username='"+req.body.user+"' AND pass='"+sha256(req.body.pass, rows1[0].salt).passwordHash+"'", function(err, rows)
			{
				//console.log(rows);
				if(err) throw err;
				if(rows.length == 0)
				{
					res.send({valid:0});
					return;
				}
				if(userid[req.body.user] != undefined) token[req.body.token] = userid[req.body.user];
				else userid[req.body.user] = tk; 
				//ADD HERE LOADING OF OTHER INFO
				users[userid[req.body.user]].points = rows[0].points;
				users[userid[req.body.user]].image = rows[0].imgopen;
				users[userid[req.body.user]].allowed = [1];
				users[userid[req.body.user]].tried = [];
				users[userid[req.body.user]].words = 0;
				users[userid[req.body.user]].lang = rows[0].lang;
				name[userid[req.body.user]] = req.body.user;
				//console.log(users, userid[req.body.user]);
				res.send({valid:1});
			});
		});
	}
	else res.send({valid: 1});
});
app.post('/logout', function(req, res)
{
	console.log(req.body);
	if(req.body.token != undefined && check(req.body.token))
	{
		var tk = token[req.body.token];
		if(tk == undefined) return;
		name[tk] = undefined;
		users[ul++].points = users[tk].points;
		users[ul-1].image = users[tk].image;
		users[ul-1].allowed = users[tk].allowed;
		users[ul-1].tries = users[tk].trie;
		users[ul-1].words = users[tk].words;
		users[ul-1].lang = users[tk].lang;
		token[req.body.token] = ul-1;
	}
});
app.post('/checkToken', function(req, res)
{
	if(req.body.token != undefined && check(req.body.token) && token[req.body.token] == undefined)
	{
		var ntoken = genToken(); // Assign a new token to the user
		if(token[ntoken] != undefined) return;
		res.send({valid: 0, ntk: ntoken});
		token[ntoken] = ul;
		users[ul ++] = {token: ntoken};
		users[ul-1].image = 0;//Math.floor(Math.random()*images.length); // Assign an image
		users[ul-1].allowed = [1]; // Allowed squares to reveal
		users[ul-1].points = 10000; // Current result
		users[ul-1].lang = "word"; //language
		users[ul-1].tried = [];
		users[ul-1].words = 0;
		console.log("User "+ul+" has token "+ntoken+", image ",users[ul-1].image);
	}
	else if(req.body.token != undefined && check(req.body.token)) res.send({valid: 1});
});
app.post('/getElement', function(req, res)
{
	//console.log(req.body);
	if(req.body.token == undefined || !check(req.body.token)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	var w = req.body.which // element to be returned
	var dat = images[users[tk].image];
	if(dat == undefined)
	{
		if(w == -1) res.send('000000');
		else
		{
			res.send({tl: '000000', 
		  	      tr: '000000', 
		  	  	  bl: '000000', 
		  	  	  br: '000000'});
		}
	}
	//console.log(w, users[tk].allowed);
	else if(w == -1) res.send(dat.substring(0, 6));
	else if(users[tk].allowed[w] != 1 || dat.length < (w*4+5)*8) res.send({});
	else
	{
		if(users[tk].points <= 0 && w > 4)
		{
			res.send({tl: '000000', 
		  	      tr: '000000', 
		  	  	  bl: '000000', 
		  	  	  br: '000000'});
			return;
		}
		if(w>4) users[tk].points --;
		res.send({tl: dat.substring((w*4+1)*8, (w*4+2)*8), 
		  	      tr: dat.substring((w*4+2)*8, (w*4+3)*8), 
		  	  	  bl: dat.substring((w*4+3)*8, (w*4+4)*8), 
		  	  	  br: dat.substring((w*4+4)*8, (w*4+5)*8)}
		);
		users[tk].allowed[4*w+1] = 1;
		users[tk].allowed[4*w+2] = 1;
		users[tk].allowed[4*w+3] = 1;
		users[tk].allowed[4*w+4] = 1;
	}
});
app.post('/getLeaderbord', function(req, res)
{
	//console.log(req.body);
	if(req.body.token == undefined || !check(req.body.token)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	img.query("SELECT username,points FROM users ORDER BY points DESC LIMIT 10", function(err, rows)
	{
		if(err) throw err;
		var ret = [];
		if(rows.length == 0) return;
		for(var i = 0; i < 10; i ++)
		{
			if(rows[i] == undefined) break;
			ret[i] = {name:rows[i].username,points:rows[i].points};
		}
		if(users[tk].points < rows[rows.length-1].points && name[tk] != undefined)
		{
			img.query("SELECT username,points FROM users ORDER BY points DESC", function(err1, rows1)
			{
				if(err1) throw err1;
				for(var i = 0; i < rows1.length; i ++)
				{
					if(rows1[i].username == name[tk])
					{
						ret[10] = {pos:i+1,name:name[tk],points:rows1[i].points};
						break;
					}
				}
				res.send(ret);
			});
		}
		else res.send(ret);
	});
});
app.post('/checkLogin', function(req, res)
{
	if(req.body.token == undefined || !check(req.body.token)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	if(name[tk] != undefined)
	{
		res.send({logged:1,username:name[tk],points:users[tk].points});
	}
	else res.send({logged:0});
});
app.post('/changeLang', function(req, res)
{
	//console.log(req.body);
	if(req.body.token == undefined || !check(req.body.token) || req.body.lang == undefined || !check(req.body.lang)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	if(name[tk] != undefined)
	{
		img.query("UPDATE users SET lang='"+req.body.lang+"' WHERE username='"+name[tk]+"'", function(err, rows)
		{
			//console.log(rows);
			if(err) throw err;
		});
	}
	users[tk].lang = req.body.lang;
	res.send({valid: 1});
	//console.log(users[tk]);
});
app.post('/tryWord', function(req, res)
{
	//console.log(req.body);
	if(req.body.word == undefined || req.body.token == undefined || !check(req.body.token) || !check(req.body.word)) return;
	//console.log('bug');
	var tk = token[req.body.token];
	if(tk == undefined) return;
	//console.log('bug');
	var w = req.body.word // word to check
	var id = imgid[users[tk].image];
	console.log(w);
	if(users[tk].tried[w]) return;
	//console.log('bug');
	users[tk].tried[w] = 1;
	img.query("SELECT times FROM keywords WHERE imgid="+id+" AND "+users[tk].lang+"='"+w+"'", function(err, rows)
	{
		if(err) throw err;
		if(rows.length == 0)
		{
			//HERE HAPPENS SOME POINT AND NEW WORD STUFF
			//
			if(users[tk].points < 50)
			{
				res.send({times:0, inserted: 0, points: 'NEP'});
				return;
			}
			users[tk].points -= 50;
			img.query("INSERT INTO temp ("+users[tk].lang+", imgid, times) VALUES ('"+w+"',"+id+",1) ON DUPLICATE KEY UPDATE times=times+1", function(err, rows) // MAYBE IN THE FUTURE TO HAVE CONTROL NOT INSERT EVERYTHING
			{
				if(err) throw err;
			});
			//
			res.send({times:0, inserted: 1, points: -50});
		}
		else
		{
			//console.log(rows);
			img.query("SELECT * FROM keywords WHERE imgid="+id+" ORDER BY times DESC LIMIT 10", function(err1, rows1)
			{
				if(err1) throw err1;
				var sum = 0;
				var perc = [];
				//console.log(rows1);
				for(var i = 0; i < rows1.length; i ++) sum += rows1[i].times;
				for(var i = 0; i < rows1.length; i ++) eval("perc[rows1[i]."+users[tk].lang+"]=1-rows1[i].times/sum;"); 
				var pts=0;
				if(perc[w] != undefined)
				{
					users[tk].points += Math.floor(multiplier*perc[w]*100);
					pts = Math.floor(multiplier*perc[w]*100);
					users[tk].words ++;
				}
				console.log(pts);
				res.send({inserted:1, points: pts});
			});
			img.query("UPDATE keywords SET times=times+1 WHERE "+users[tk].lang+"='"+w+"' AND imgid="+id, function(err1, rows1)
			{
				if(err1) throw err1;
			});
		}
	});
});
//NOT TESTED YET
app.post('/nextImage', function(req, res)
{
	if(req.body.token == undefined || !check(req.body.token)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	if(images[users[tk].image] != undefined) users[tk].image ++; // Assign an image
	if(images[users[tk].image] == undefined)
	{
		res.send({valid:0});
		users[tk].image --;
	}
	else
	{
		users[tk].allowed = [1];
		if(users[tk].words > 2) users[tk].points += 2000;
		if(users[tk].words == 10) users[tk].points += 3000;
		else users[tk].points -= 700;
		users[tk].words = 0;
		users[tk].tried = [];
		console.log(req.body.token, users[tk].image);
		res.send({valid:1});
	}
	if(name[tk] != undefined)
	{
		img.query("UPDATE users SET points="+users[tk].points+" WHERE username='"+name[tk]+"'", function(err, rows)
		{
			if(err) throw err;
		});
		img.query("UPDATE users SET imgopen="+users[tk].image+" WHERE username='"+name[tk]+"'", function(err, rows)
		{
			if(err) throw err;
		});
	}
});
app.post('/getPoints', function(req, res)
{
	if(req.body.token == undefined || !check(req.body.token)) return;
	var tk = token[req.body.token];
	if(tk == undefined) return;
	res.send({points:users[tk].points});
});
//END
function loadImages()
{
	var query = img.query("SELECT COUNT (*) AS total FROM images", function(err, res)
	{
			console.log("Counted "+res[0].total+" images");
			img.query('SELECT CONVERT(dat USING utf8) AS res FROM images', function(err,rows)
		{
				if(err) throw err;

	  		for(var i = 0; i < rows.length; i ++) images[i] = rows[i].res;
	  		//console.log('Image data received and loaded');
	  		//console.log(images[2]);
		});
	});
	img.query("SELECT id FROM images", function(err, res)
	{
		for(var i = 0; i < res.length; i ++) imgid[i] = res[i].id;
		//console.log(imgid);
	});
	setTimeout(loadImages, 600000);
}
img.connect(function(err)
{
	if(err) console.log("Error connecting to image and keyword database "+err);
	else
	{
		console.log("Image and keyword database connected");
 		loadImages();		
	}
});
https.createServer(credentials, app).listen(443, function()
{  
    console.log('HTTPS server started on port 443');
    //commandLine();
});
/*http.createServer(function(req, res)
{
	res.statusCode = 301;
	res.setHeader('Location', 'https://'+req.headers.host.split(':')[0]+req.url);
	res.setHeader('Strict-Transport-Security','max-age=31536000;');
	return res.end();
}).listen(80);
/*http.createServer(function(req, res) {
	//console.log(req.url.slice(1));
	if(req.url.slice(1) != 'favicon.ico') eval(req.url.slice(1));
 	return res.end();
}).listen(3000);*/
//HTTP_redirect();
/*
app.listen(80, function ()
{
  console.log('App listening on port 80!');
});*/
