var CryptoJS = require("crypto-js");
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');
var fs = require('fs');
var DB_FILE_NAME = 'database.db';
var SECRET_KEY = 'notsosecret';
var db = new sqlite3.Database(DB_FILE_NAME);
var btoa = require('btoa');
var atob = require('atob');

app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



app.post('/login', function(req,res){
console.log(req);
var username = req.body.username;
var pass = req.body.password;
console.log(username);
console.log(pass);

db.serialize(function() {
	db.each("SELECT password FROM user WHERE name='" + username + "'", function(err, row) {
		var dbPass =decrypt(row.Password,SECRET_KEY);
		console.log("DB Pass :",dbPass);
		if (pass == dbPass){
			res.sendFile(__dirname + "/main.html");
		}else{
			res.end("INCORRECT");
		}
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
function decrypt(hash,key){

var decrypted = CryptoJS.AES.decrypt(
        hash,key,
        {   
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );
return decrypted.toString(CryptoJS.enc.Utf8);
}
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
