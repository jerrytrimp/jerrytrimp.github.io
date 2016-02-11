'use strict';

angular.module('TravelBlog.register', ['ngRoute','firebase', 'TravelBlog.common'])

.config(['$routeProvider', function($routeProvider) {
    //TODO: uncomment code below when you need to register an other user
  /*$routeProvider.when('/register', {
    templateUrl: './admin/register/register.html',
    controller: 'RegisterCtrl'
  });*/
}])

.controller('RegisterCtrl', ['$scope','$location','$firebaseAuth', '$controller', function($scope,$location,$firebaseAuth,$controller) {

    // Extend the base controller
    angular.extend(this, $controller('SharedCtrl', {$scope: $scope}));

 	var firebaseObj = new Firebase("https://glowing-inferno-8985.firebaseio.com");
    var auth = $firebaseAuth(firebaseObj);

 var login={};
$scope.login=login;

        $scope.signUp = function() {
    if (!$scope.regForm.$invalid) {
        var email = $scope.user.email;
        var password = $scope.user.password;
        if (email && password) {
	login.loading = true;
            auth.$createUser(email, password)
                .then(function() {
                    // do things if success

                    $scope.handleToastEvents('User creation success', false);
                    $location.path('/login');
                }, function(error) {
                    // do things if failure
                    $scope.handleToastEvents('Error: '+error, true);
                    $scope.regError = true;
                    $scope.regErrorMessage = error.message;
                });
        }
    }
};
}]);
