var app = angular.module('hairdresserApp', ['chart.js']);
app.controller('mainController', function($scope, $http) {
	$scope.currentPage= 'Home';
  $scope.overallAvg;
  $scope.highestDay;
  $scope.graphData = {
    "weekAvg": {
      "labels":["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52"],
      "series": ['Weekly Average'],
      "data": []

    },
    "dayAvg": {
      "labels":['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      "series": ['Average by Day'],
      "data": []
    }
  }

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
    errorText += "Invalid landline; \n"
  }
  if (mob_num_entered.search(mob_num_pattern) != 0) {
    errorText += "Invalid mobile number; \n"
  }
  if (fname.search(name_pattern) != 0) {
    errorText += "Invalid first name; \n"
  }
  if (lname.search(name_pattern) != 0) {
    errorText += "Invalid last name; \n"
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
      $scope.currentView = '';
      $scope.userAlert.text = "Customer added successfully!";
      $scope.userAlert.shown = true;
    }
  })
  }else{
   document.getElementById('validate').textContent = errorText;
 }
}
$scope.refreshCustomers = function() {
	$http.get('/customers')
	.then(function(response) {
		$scope.customers = response.data;
		console.log($scope.customers);
	})
}
$scope.addTransaction = function(amount, date, custID){
  console.log(amount, date, custID);
  $http({
    url: '/addtrans',
    method: "GET",
    params: {amount, date,custID }
  })
  .then(function(response) {
    console.log(response);
     if (response.data === 'success'){
      $scope.currentView = '';
      $scope.userAlert.text = "Transaction added successfully!";
      $scope.userAlert.shown = true;
    }
  })
}
$scope.refreshRecent = function() {
	$http.get('/recent')
	.then(function(response){
		$scope.recentTrans = response.data;
		console.log($scope.recentTrans);
	});
}
$scope.updateCustomer = function(customer){
  var id = customer.ID;
  var fname = customer.FName;
  var lname = customer.LName;
  var landline = customer.LanNum;
  var mobile = customer.MobNum;
  var email = customer.Email;
  $http({
   url: '/editcust',
   method: "GET",
   params: {id, fname, lname,landline,mobile,email}
 })
  .then(function(response) {
   console.log(response);
   if (response.data === 'success'){
    $scope.currentView = '';
    $scope.userAlert.text = "Customer details updated";
    $scope.userAlert.shown = true;
  }
})
}
$scope.editPressed = function(customer){
  console.log(customer);
  $scope.editCustomer = customer;
  $scope.currentView = 'editcust';
}
$scope.getStats = function(){
	console.log('Requesting stats');
	$http.get('/statistics')
	.then(function(response){
		$scope.graphData.weekAvg.data = response.data.weeklyAverage;
    $scope.graphData.dayAvg.data = response.data.daysAverageRevenue;
    $scope.overallAvg = response.data.dailyAverage;
    $scope.highestDay = response.data.dayHighest;
    console.log($scope.graphData);
  });
}
$scope.setQueryId = function(id){
	$scope.queryId = id;
}
$scope.refreshRecent();
});
