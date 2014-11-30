(function() {
	'use strict';

	angular
		.module('YHOJservices', [])
		.constant('KEY', 'cd')
		.factory('FlashService', FlashService)
		.factory('HelperService', HelperService)
		.factory('FormService', FormService)
		.factory('CountdownService', CountdownService)
		.factory('ResultService', ResultService);


	FlashService.$inject = ['$rootScope', '$timeout']; 

	function FlashService($rootScope, $timeout) {

		var counter = 0;

		var flashShake = function() {
			if (!counter) {
				counter = 1;
				return;
			}
		
			$rootScope.flash.shake = true;

			$timeout(function(){
				$rootScope.flash.shake = false;
			}, 700, true);
		};

		var service = {
			show: function(status) {
				var flash = { 
							errors: [], 
							shake: false 
						},
						i;

				for (i in status) {
					if (!status[i]) flash.errors.push(i);
				}

				if (flash.errors.length) {
					$rootScope.flash = flash;
					jQuery('html, body').animate({ scrollTop: 0 }, 'easeOutQuart');
					flashShake();
				}
			},
			clear: function() {
				$rootScope.flash = '';
				counter = 0;
			}
		};

		return service;		
	}


	function HelperService() {

		var service = {
			timeToMilli: function(time) {
				var hours = parseInt(time.hour1.toString() + time.hour2.toString()),
				    mins  = parseInt(time.min1.toString() + time.min2.toString());

				return (hours * 3600000) + (mins * 60000);
			},
			timeToUnix: function(time) {
				var time = this.timeToMilli(time);

				return Math.floor(new Date().getTime() + time);
			}
		};

		return service;
	}


	FormService.$inject = ['CountdownService', 'FlashService', 'localStorageService', 'KEY'];

	function FormService(CountdownService, FlashService, localStorageService, KEY) {

		var service = {
			validate: function(input) {
				var input = input || {};

				if (input.task && input.limit && input.limitUnix) {
					return true;
				}
				FlashService.show({
					'Please set a task'      : input.task,
					'Please set a time limit': input.limit
				});

				return false;
			},
			startTask: function(input) {
				CountdownService.startTask(input);
			},
			isStorageSet: function() {
				return !!localStorageService.get(KEY);
			},
		};

		return service;
	}


	CountdownService.$inject = ['$location', 'FlashService', 'localStorageService', 'KEY'];

	function CountdownService($location, FlashService, localStorageService, KEY) {

		var countdownData;

		var service = {
			startTask: function(input) {
				countdownData = input || null;

				if (localStorageService.length()) {
					countdownData = localStorageService.get(KEY);
				} else {
					localStorageService.set(KEY, JSON.stringify(countdownData))
				}

				$location.path('/countdown');
			},
			finishTask: function() {
				countdownData = null;
			},
			cancelTask: function() {
				localStorageService.clearAll();
				countdownData = null;
			},
			getInputData: function() {
				return countdownData;
			}
		};

		return service;
	}


	ResultService.$inject = ['$location', 'localStorageService', 'KEY']; 
		
	function ResultService($location, localStorageService, KEY) {

		var pages = {
			congrats: [
		    'dblrnbw', 'smile', 'average-at-life', 'couple-months',
		    'diamond', 'golden-jazz', 'good-on-you', 'heart-in-it',
		    'isle-pop', 'nicely-done', 'phil-good', 'proud-of-you',
		    'shreddied', 'smile', 'spunky', 'thatll-do', 'wee-green-jig',
		    '50-shades', 'affection', 'bagels', 'bathroom', 'blue-car',
		    'cached', 'chicken-weasel', 'dancing-shoes', 'did-thing', 
		    'done-did', 'doughnuts', 'enjoyed', 'felicity', 'finnish', 'flip',
		    'guts', 'happy-computer', 'john-donne', 'like', 'moby', 'more-fun',
		    'moss', 'over-9000', 'stuff', 'tears-of-happy', 'wizened', 'you-go'
			],
			fail: [
		    'bad-try', 'booo', 'firework', 'get-cereals',
		    'golf-carts', 'my-plants', 'noodle', 'scamburger',
		    'whoopsie', 'dishonour', 'doperoni', 'flop', 'intersection',
		    'lacrosse', 'life-savings', 'mad-scientists', 'nogo', 'pea-brain', 
		    'sassberry', 'squirt-bottle', 'sunday', 'time-dream', 'utter', 'why'
			]
		};

		var service = {
			allSystemsGo: function() {
				var storage = localStorageService.get(KEY);

				localStorageService.clearAll();
				
				return storage && storage.task && storage.limit && storage.limitUnix;
			},
			getRandomResult: function(type) {
				if (type === 'congrats' || type === 'fail') {
					return pages[type][Math.floor(Math.random() * pages[type].length)];
				}
				return false;
			}
		};

		return service;
	}
})();