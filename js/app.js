angular.module('YHOJ', [
    'ngRoute', 
    'YHOJdirectives', 
    'YHOJservices',
    'YHOJcontrollers'
])

.run(['$browser', function($browser) {
    $browser.baseHref = function() { return '/0yhoj/' };
}])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/startscreen.html',
            controller: 'startscreenCtrl'
        })
        .when('/countdown', {
            templateUrl: 'views/countdown.html',
            controller: 'countdownCtrl'
        })
        .otherwise({ 
            redirectTo: '/' 
        });

	$locationProvider.html5Mode(true);
}])
