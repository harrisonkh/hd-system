var CryptoJS = require("crypto-js");
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');
var fs = require('fs');
var DB_FILE_NAME = 'database.db';
var SECRET_KEY = 'notsosecret';
var db = new sqlite3.Database(DB_FILE_NAME);

app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



app.post('/login', function(req,res){

var username = req.body.username;
var pass = req.body.username;
console.log(username);
console.log(pass);

db.serialize(function() {
	db.each("SELECT password FROM user WHERE name='" + username + "'", function(err, row) {
		console.log("found password",decrypt(row.Password));
  });
  
});

// Encrypt 
});
app.get('/',function(req,res){
	res.sendFile(__dirname + '/login.html');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});

function encrypt(toEncrypt){
	return CryptoJS.AES.encrypt(toEncrypt, SECRET_KEY).toString();
}
function decrypt(hash){
	return CryptoJS.AES.decrypt(hash, SECRET_KEY).toString();
}