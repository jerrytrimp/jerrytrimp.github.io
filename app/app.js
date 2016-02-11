'use strict';

// Declare app level module which depends on views, and components
angular.module('TravelBlog', [
    'ngRoute',
    'angularLazyImg',
	'TravelBlog.common',
    'TravelBlog.index',
    'TravelBlog.login',
    'TravelBlog.register',
    'TravelBlog.admin'
]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/'});
    }]);
