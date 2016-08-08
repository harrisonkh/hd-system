var app = angular.module('hairdresserApp', []);
app.controller('mainController', function($scope, $http) {
	$scope.currentPage= 'home';
	$scope.queryId = '';
	$scope.userAlert = {
		'shown': false,
		'text': ''
	}
	$scope.recentTransFormatted = function(trans){
		var returnVal = trans["Date"] + ' ' + trans.Amount + ' ' + trans.FName + ' ' ;
		var contactNum = (trans.MobNum != null) ? trans.MobNum:trans.LanNum;
		return returnVal + contactNum;
	}
	$scope.customerFormatted = function(cust){
		console.log("Formatted customer");
		return cust.FName + " " + cust.LName + " " + cust.MobNum + " " + cust.LanNum + " " + cust.Email;
	}
	$scope.setCurrentPage = function(pageName) {
		console.log(pageName);
		$scope.currentPage = pageName;
	}
	$scope.performQuery = (qryId,qryText)=>{
		console.log(qryId, qryText);
		$http.get({
				url: '/query', 
				method: "GET",
				params: {qryId,qryText}
			})
			.then(function(response) {
				console.log(response);
				//Display query results
			})
	}
	$scope.addCustomer = function(fname,lname,landline,mobile,email) {
		console.log(fname, lname);
		var landline_pattern = /^(\(0[2|3|4|7|8]\))?\d{8}/i;
		var mob_num_pattern = /^(\+61)?0?\d{9}/i;
		var name_pattern=/^[a-zA-Z]{2,}/i;

		var landline_entered = document.getElementById("landline").value;
		var mob_num_entered = document.getElementById("mobile").value;
		var fname= document.getElementById("fname").value;
		var lname = document.getElementById("lname").value;

		var errorText = "";
		if (landline_entered.search(landline_pattern) != 0) {
			errorText += "invalid landline \n"
		}
		if (mob_num_entered.search(mob_num_pattern) != 0) {
			errorText += "invalid mobile number \n"
		}
		if (fname.search(name_pattern) != 0) {
			errorText += "invalid first name \n"
		}
		if (lname.search(name_pattern) != 0) {
			errorText += "invalid last name \n"
		}
		if (errorText === ""){
			$http({
				url: '/addcust', 
				method: "GET",
				params: {fname, lname,landline,mobile,email}
			})
			.then(function(response) {
				console.log(response);
				if (response.data === 'success'){
					$scope.userAlert.text = "Customer added successfully!";
					$scope.userAlert.shown = true;
				}
			})
		}else{
			document.getElementById("validate").innerText = errorText;
		}
	}
	$scope.refreshCustomers = function() {	
		$http.get('/customers')
		.then(function(response) {
			$scope.customers = response.data;
			console.log($scope.customers);
		})
	}

	$scope.refreshRecent = function() {
		$http.get('/recent')
		.then(function(response){
			$scope.recentTrans = response.data;
			console.log($scope.recentTrans);
		});
	}
	$scope.setQueryId = function(id){
		$scope.queryId = id;
	}
	$scope.refreshRecent();
});
