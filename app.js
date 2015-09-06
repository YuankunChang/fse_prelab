var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var socketIO = require('socket.io');
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var globalsocket;

var engines = require('consolidate');
app.engine('html', engines.hogan); // Tell Express to run .html files through Hogan
app.set('views', __dirname + '/views'); // Tell Express where to find templates
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public'))); // Tell Express where to find static JS and CSS files

db = new sqlite3.Database('chatroom.db');
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');

var query = 'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, body TEXT, time INTEGER)';
conn.query(query).on('end', function() {
	console.log('Created TABLE');
});

//req.body时要用到
// app.use(express.bodyParser());

//进入login页面
app.get('/', function(req, res){
  res.sendfile('login.html');
});

//得到login页面的username
app.post('/', function(req, res){
  	console.log("post received");
  	// var name = request.params.roomName;	
  		// 'ABC123'
  	console.log(req.body);
	var username = req.body.username;	// 'Miley'

	// var q = conn.query('INSERT INTO messages(username) VALUES ($1)', [username]);
	// q.on('error', console.error);
	console.log('Username: ' + username);
	//?

	res.render('index.html',{username:username});
	console.log('Now in the index.html');
});


// Live Server
var server = app.listen(3000, function(error, response) {
	if(error) {
		console.log('Error: ' + error);
	}
	else {
		console.log('Server listening on Port ' + this.address().port);
	}
});

var io = socketIO(server);

io.on('connection', function(socket){
	// socket.broadcast.emit('user connected');
	console.log('a user connected');	

	// var q = conn.query('SELECT * FROM messages');


	socket.on('new html', function(){

		db.all('SELECT * FROM messages', function(err, rows){
				var i = 0,
				    length,
					row;

				var message = [];

				if (err) throw err;
				
				for (length = rows.length; i < length; i++) {
					row = rows[i];
					var message = {
						username: row.username,
						message: row.body,
						time: row.time
					}
					socket.emit('chat message', message);
				}
				console.log(rows);
			});
	});

 	socket.on('new message', function(data){
 		var username = data.username;
 		var message = data.message;
 		var time = new Date();

		var convertedTime = '';
		var hours = time.getHours();
		var minutes = time.getMinutes();

		if (minutes < 9) {
			minutes = '0' + minutes;
		}

		convertedTime = hours + ':' + minutes;

 		data.time = convertedTime;
 		time = convertedTime;

  		console.log('received msg');
  		console.log('Username ' + username + ' Message '+ message +' Time ' + time);


  		// var q = conn.query('SELECT * FROM messages WHERE body ="' + msg  + '"');

		var q = conn.query('INSERT INTO messages(username,body,time) VALUES ($1,$2,$3)', [username,message,time]);

		q.on('error', console.error);
		//q1.on('error',)

    // console.log('message: ' + q);
    	io.emit('chat message', data);

  	});

});
