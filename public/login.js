var app = angular.module('loginApp',[]);
app.controller('mainController', function($scope, $http) {
  $scope.login = function(username,password){
    console.log(username,password);
    $http.post('/login',{username, password}).then(function(response) {
    console.log(response);
  });
 }
});
