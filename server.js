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


//compare username + password provided compared to the username(s) and password(s) provided in the database
app.post('/login', function(req,res){
	console.log(req);
	var username = req.body.username;
	var pass = req.body.password;
	console.log(username);
	console.log(pass);

	res.sendFile(__dirname + "/main.html");

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
});
app.get('/',function(req,res){
	res.sendFile(__dirname + '/login.html');
});
app.get('/addcust',function(req,res){
	console.log(req);
	var fname = req.query.fname;
	var lname =  req.query.lname;
	var mobnum =  req.query.mobile;
	var landline =  req.query.landline;
	var email =  req.query.email;


	db.serialize(function(){
		db.run("INSERT INTO Customers (FName, LName, MobNum, Email, LanNum) VALUES ('" + fname + "','" + lname + "','" + mobnum + "','" + email + "','" + landline + "')", 
			function(err){
				if (!err){
					res.end('success');
				}else{
					console.log(err);
				}
			});
	});
});
app.get('/query',function(req,res){
	console.log(req.query, "TEST");
	var matches = [];
	var queryString = '';
	var queryColumn = '';
	console.log("Unexpected query parameter");
	if (req.query.fname){
		console.log('FName');
		queryColumn = 'FName';
		queryString = req.query.fname;
	}else if(req.query.lname){
		queryColumn = 'LName';
		queryString = req.query.lname;
	}else if (req.query.phone){
		queryColumn = 'LanNum OR MobNum';
		queryString = req.query.phone;
	}else if (req.query.email){
		queryColumn = 'Email';
		queryString = req.query.email;
	}else{
		console.log("Unexpected query parameter")
		res.send(matches);
		return -1;
	}
	console.log(queryString, queryColumn);
	//const SQL_STATEMENT = 'SELECT * FROM Customers';

	const SQL_STATEMENT = 'SELECT * FROM Customers WHERE ' + queryColumn + ' LIKE \'' + queryString +'%\' ORDER BY FName DESC';
	db.serialize(function(){
		db.each(SQL_STATEMENT, function(err,row){
			if (err) console.log(err);
			matches.push(row);
		}, function(){
			/*bubbleSort(matches, queryColumn);
			console.log("Sort complete: ",matches);
			binarySearch(matches, queryColumn, queryString);
			console.log("Search complete: ", matches);*/
			res.send(matches);
		});
	});
});

app.get('/addtrans',function(req,res){
	console.log(req);
	var amount = req.query.amount;
	var date =  req.query.date;
	var custID =  req.query.custID;
	db.serialize(function(){
		db.run("INSERT INTO Transactions (Amount, Date, CustID) VALUES (" + amount + ",'" + date + "','" + custID + "')", 
			function(err){
				if (!err){
					res.end('success');
				}else{
					console.log(err);
				}
			});
	});
});
app.get('/recent',function(req,res){
	console.log("Recent transaction list requested");
	db.serialize(function(){
		var transactions =[];
		db.each("SELECT Amount, Date, FName, MobNum, LanNum FROM transactions INNER JOIN customers ON transactions.custid = customers.id ORDER BY date DESC LIMIT 10", function(err,row){
			transactions.push(row);
		}, function(){res.send(transactions);});
	})
});
app.get('/statistics',function(req,res){
	console.log("Statistics requested");
	const DAYS = ['Monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday', 'Sunday'];
	var statistics = {
		'dailyAverage' : 0.00,
		'weeklyAverage': [],
		'daysRevenue': []
	}

	const SQL_STATEMENT = 'SELECT * FROM Transactions';
	var dbRows;

	var startingWeek = 0;
	var weeklyTrans = new Array[52];
	for(var i =0; i<dbRows.length; i++){
		var dateFormatted = formatDate(dbRows[i].Date);
		weeklyTrans[ getWeekOfYear(dateFormatted) ].push(dbRows[i].Amount);
	}

	res.send(statistics);
});
app.get('/customers',function(req,res){
	console.log("customers list requested");
	db.serialize(function(){
		var customers =[];
		db.each("SELECT * FROM Customers", function(err,row){
			customers.push(row);
		}, function(){res.send(customers);});
	})
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
function bubbleSort(array, field){
	for (var i=0; i<array.length-1;i++) {
		if (array[i][field] > array[i+1][field]) {
			swap(array, i, i+1);
		}
	}

}
function swap(array, index1, index2){
	var temp = array[index1];
	array[index1] = array[index2];
	array[index2] = temp;
}
function binarySearch(array, field, value){
	var found=false;
	var length = array.length-1;
	var position = Math.floor(length/2);
	var matches = [];
	while (!found) {
		if (value < array[position][field]) {
			position = Math.floor(position/2);
		}else if (value > array[position][field])  {
			position = length-Math.floor(position/2);
		}else if (array[position][field].startsWith(value)){
			//found = true;
			matches.push(position);
		}else{
			found = true;
			return -1;
		}
	}
}
function getWeekOfYear(date){
	var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	var month = date.getMonth();
	var dayOfMonth = date.getDate();

	var week = Math.floor((dayCount[month]+dayOfMonth)/7);

	return week;
}