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

Array.prototype.getAverageField = function(field){
	var total=0;
	if (this.length != 0){
		for (var i =0; i < this.length;i++){
			total += this[i][field];
		}
		return (total/this.length).toFixed(2);
	}else{
		return 0;
	}
}
Array.prototype.getAverage = function(){
	var total=0;
	if (this.length != 0){
		for (var i =0; i < this.length;i++){
			total += this[i];
		}
		return (total/this.length).toFixed(2);
	}else{return 0;}
}
Array.prototype.getPosMaxVal = function(){
	var maxPos = 0;
	for (var i = 0; i< this.length; i++){
		if (this[i]>this[maxPos])
			maxPos = i;
	}
	return maxPos;
}
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
app.get('/editcust',function(req,res){
  console.log(req);
  var id = req.query.id;
  if (id != null){
    var fname = req.query.fname;
    var lname =  req.query.lname;
    var mobnum =  req.query.mobile;
    var landline =  req.query.landline;
    var email =  req.query.email;


    db.serialize(function(){
      db.run("UPDATE Customers SET FName=" + fname + ", LName=" + fname + ", MobNum=" + mobnum + ", Email=" + email +
        ", LanNum=" + landline + "  WHERE id=" + id,
        function(err){
          if (!err){
            res.end('success');
          }else{
            console.log(err);
          }
        });
    });
  }else{res.end('failed');}
});
app.get('/query',function(req,res){
	console.log(req.query, "TEST");
	var matches = [];
	var queryString = '';
	var queryColumn = '';
	if (req.query.qryId === 'fname'){
		console.log('FName');
		queryColumn = 'FName';
		queryString = req.query.qryText;
	}else if(req.query.qryId === 'lname'){
		queryColumn = 'LName';
		queryString = req.query.qryText;
	}else if (req.query.qryId === 'phone'){
		queryString = req.query.qryText;
	}else if (req.query.qryId === 'email'){
		queryColumn = 'Email';
		queryString = req.query.qryText;
	}else{
		console.log("Unexpected query parameter")
		res.send(matches);
		return -1;
	}
	console.log(queryString, queryColumn);
	//const SQL_STATEMENT = 'SELECT * FROM Customers';
	if (req.query.qryId !== 'phone'){
		const SQL_STATEMENT = 'SELECT * FROM Customers WHERE ' + queryColumn + ' LIKE \'' + queryString +'%\' ORDER BY FName DESC';
		console.log(SQL_STATEMENT);
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
	}else{
		const SQL_STATEMENT = 'SELECT * FROM Customers';
		console.log(SQL_STATEMENT);
		db.serialize(function(){
			db.each(SQL_STATEMENT, function(err,row){
				if (err) console.log(err);
				matches.push(row);
			}, function(){
				bubbleSort(matches, 'MobNum');
				console.log("Sort complete: ",matches);
				var match = binarySearch(matches, 'MobNum', queryString);
				console.log("Search complete: ", match);
				if (match == []){
					bubbleSort(matches, 'LanNum');
					console.log("Sort complete: ",matches);
					match = binarySearch(matches, 'LanNum', queryString);
					console.log("Search complete: ", match);
					res.send(match);
				}else{
					res.send(match);
				}
			});
		});
	}
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
	const DAYS = ['Sunday','Monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday'];
	var statistics = {
		'dailyAverage' : 0.00,
		'weeklyAverage': [],
		'daysAverageRevenue': [],
		'dayHighest':''
	}

	const SQL_STATEMENT = 'SELECT * FROM Transactions';

	var dbRows=[];
	db.serialize(function(){
		db.each(SQL_STATEMENT, function(err,row){
			dbRows.push(row);
		}, function(){
			statistics.dailyAverage = dbRows.getAverageField('Amount');
			var weeklyTrans =[[]];
			createEmptyArrays(weeklyTrans, 52);
			for(var i =0; i<dbRows.length; i++){
				var dateFormatted = formatDate(dbRows[i].Date);
				weeklyTrans[ getWeekOfYear(new Date(dateFormatted)) ].push(dbRows[i].Amount);
			}
			console.log(weeklyTrans);
			for (var i =0; i<weeklyTrans.length; i++){
				statistics.weeklyAverage.push(weeklyTrans[i].getAverage() == null ? 0 : weeklyTrans[i].getAverage());
			}

			var dailyTrans = [[]];
			createEmptyArrays(dailyTrans, 7);
			for(var i=0; i<dbRows.length; i++) {
				var dateFormatted = formatDate(dbRows[i].Date);
				dailyTrans[ new Date(dateFormatted).getDay() ].push(dbRows[i].Amount);
			}
			console.log(dailyTrans);
			for (var i =0; i<dailyTrans.length; i++){
				statistics.daysAverageRevenue.push(dailyTrans[i].getAverage() == null ? 0 : dailyTrans[i].getAverage());
			}
			statistics.dayHighest = DAYS[statistics.daysAverageRevenue.getPosMaxVal()];
			res.send(statistics);
		});
	})


});
app.get('/customers',function(req,res){
	console.log("Customers list requested");
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
	swapped = true;
	while (swapped){
		swapped = false;
		for (var i=0; i<array.length-1;i++) {
			if (array[i][field] > array[i+1][field]) {
				swap(array, i, i+1);
				swapped = true;
			}
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
	var lastPos;
	var position = Math.floor(length/2);
	while (lastPos != position) {
		if (value < array[position][field]) {
			lastPos = position;
			position = Math.floor(position/2);
		}else if (value > array[position][field])  {
			lastPos = position;
			position = lastPos + Math.floor((length - position)/2);
		}else if (array[position][field] === (value)){
			return array[position];
		}
	}
	return [];
}
function getWeekOfYear(date){
	var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	var month = date.getMonth();
	var dayOfMonth = date.getDate();

	var week = Math.floor((dayCount[month]+dayOfMonth)/7);

	return week;
}
function formatDate(date){
	var pattern = /(\d.?)\/(\d.?)\/(\d{4})/i;
	var match = date.match(pattern);
	var day = match[1];
	var month = match[2];
	var year = match[3];
	return month + '/' + day + '/' + year;
}
function createEmptyArrays(array, count){
	for (var i =0; i<(count); i++){
		array[i] = [];
	}
}
