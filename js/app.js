(function() {
  'use strict';
  
  angular
    .module('YHOJ', [
      'ngRoute', 
      'YHOJdirectives', 
      'YHOJservices',
      'YHOJcontrollers',
      'timer',
      'LocalStorageModule'
    ])
    // .run(run)
    .config(config);
  
  
  // run.$inject = ['$browser'];
  
  // function run($browser) {
  //   $browser.baseHref = function() { return '/yhoj/' };
  // }
  
  
  config.$inject = ['$routeProvider', 'localStorageServiceProvider'];

  function config($routeProvider, localStorageServiceProvider) {
  
    $routeProvider
      .when('/', {
        templateUrl: 'views/startscreen.html',
        controller: 'startscreenCtrl'
      })
      .when('/countdown', {
        templateUrl: 'views/countdown.html',
        controller: 'countdownCtrl'
      })
      .when('/congrats', {
        templateUrl: 'views/result.html',
        controller: 'congratsCtrl'
      })
      .when('/fail', {
        templateUrl: 'views/result.html',
        controller: 'failCtrl'
      })
      .otherwise({ 
        redirectTo: '/' 
      });
    
    localStorageServiceProvider
      .setPrefix('yhoj')
      .setStorageCookie(7, '/');
  }
})();