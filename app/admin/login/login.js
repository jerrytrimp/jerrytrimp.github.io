'use strict';

angular.module('TravelBlog.login', ['ngRoute', 'firebase', 'TravelBlog.common'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: './admin/login/login.html',
            controller: 'LoginCtrl'
        });
    }])

    .controller('LoginCtrl', ['$scope','$timeout', '$location', 'CommonProp', '$firebaseAuth', '$controller', function ($scope, $timeout,$location, CommonProp, $firebaseAuth,$controller) {

        // Extend the base controller
        angular.extend(this, $controller('SharedCtrl', {$scope: $scope}));

        var firebaseObj = new Firebase("https://glowing-inferno-8985.firebaseio.com");
        var loginObj = $firebaseAuth(firebaseObj);

        $scope.user = {};
        var login = {};

        $scope.login = login;
        $scope.SignIn = function (e) {
            login.loading = true;
            e.preventDefault();
            var username = $scope.user.email;
            var password = $scope.user.password;
            loginObj.$authWithPassword({
                    email: username,
                    password: password
                })
                .then(function (user) {
                    //Success callback
                    login.loading = false;
                    $scope.handleToastEvents('Authentication successful', false);
                    CommonProp.setUser(user.password.email);
                    $location.path('/admin');
                }, function (error) {
                    $scope.handleToastEvents('Authentication failure', true);
                    //Failure callback
                    login.loading = false;

                });
        }


    }])
    .service('CommonProp', ['$location', '$firebaseAuth', function ($location, $firebaseAuth) {
        var user = '';
        var firebaseObj = new Firebase("https://glowing-inferno-8985.firebaseio.com");
        var loginObj = $firebaseAuth(firebaseObj);

        return {
            getUser: function () {
                if (user == '') {
                    user = localStorage.getItem('userEmail');
                }
                return user;
            },
            setUser: function (value) {
                localStorage.setItem("userEmail", value);
                user = value;
            },
            logoutUser: function () {
                loginObj.$unauth();
                user = '';
                localStorage.removeItem('userEmail');
                $location.path('/login');
            }
        };
    }])
    .directive('laddaLoading', [
        function () {
            return {
                link: function (scope, element, attrs) {
                    var Ladda = window.Ladda;
                    var ladda = Ladda.create(element[0]);
                    // Watching login.loading for change
                    scope.$watch(attrs.laddaLoading, function (newVal, oldVal) {
                        // if true show loading indicator
                        if (newVal) {
                            ladda.start();
                        } else {
                            ladda.stop();
                        }
                    });
                }
            };
        }
    ]);
