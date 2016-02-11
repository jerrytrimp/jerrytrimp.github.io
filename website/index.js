'use strict';

angular.module('TravelBlog.index', ['ngRoute', 'TravelBlog.common'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: './website/index.html',
            controller: 'IndexCtrl'
        });
    }])
    .controller('IndexCtrl', ['$scope', '$controller', function ($scope, $controller) {

		// Extend the base controller
		angular.extend(this, $controller('SharedCtrl', {$scope: $scope}));

    }]);
