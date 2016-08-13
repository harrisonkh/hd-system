var app = angular.module('hairdresserApp', ['ngVis']);
app.controller('mainController', function($scope, $http, VisDataSet) {
	$scope.currentPage= 'home';
	$scope.graph ={
		'data':[],
		'options': {
			style:'bar',
        barChart: {width:50, align:'center'}, // align: left, center, right
        drawPoints: false,
        dataAxis: {
        	icons:true
        },
        orientation:'top',
        start: '2014-06-10',
        end: '2014-06-18'
    }
}
var dataGroups = new VisDataSet();
dataGroups.add({});
var dataItems = new VisDataSet();
dataItems.add([{}]);
dataItems.add([
                {x: '2014-06-12', y: 0},
                {x: '2014-06-13', y: 40},
                {x: '2014-06-14', y: 10},
                {x: '2014-06-15', y: 15},
                {x: '2014-06-15', y: 30},
                {x: '2014-06-17', y: 10},
                {x: '2014-06-18', y: 15},
                {x: '2014-06-19', y: 52},
                {x: '2014-06-20', y: 10},
                {x: '2014-06-21', y: 20}
            ]);
$scope.graphData = {
  items: dataItems,
  groups: dataGroups
};

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
	$http({
		url: '/query',
		method: "GET",
		params: {qryId,qryText}
	})
	.then(function(response) {
		console.log(response);
		$scope.searchResults = response.data;
				//Display query results
			})
}
$scope.addCustomer = function(fname,lname,landline,mobile,email) {
	console.log(fname, lname);
	var landline_pattern = /^(\(0[2|3|4|7|8]\))?\d{8}/i;
	var mob_num_pattern = /^(\+61)?0?\d{9}/i;
	var name_pattern=/^[a-zA-Z]{2,}/i;

	var landline_entered = landline;
	var mob_num_entered = mobile;

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
$scope.getStats = function(){
	console.log('Requesting stats');
	$http.get('/statistics')
	.then(function(response){
		$scope.graph.data = response.data.daysAverageRevenue;
		console.log($scope.graph.data);
	});
}
$scope.setQueryId = function(id){
	$scope.queryId = id;
}
$scope.refreshRecent();
});
