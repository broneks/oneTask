angular.module('YHOJservices', [])

.factory('FlashService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
	var counter = 0;

	return {
		show: function(status) {
			var i, flash = { errors: [], shake: false };

			for (i in status) {
				if (status[i] === false) flash.errors.push(i);
			}

			$rootScope.flash = flash;

			// shake animation class
			if (counter) {
				$rootScope.flash.shake = true;

				$timeout(function(){
					$rootScope.flash.shake = false;
				}, 700, true);
			} 
			else counter = 1;
		},
		clear: function() {
			$rootScope.flash = '';
			counter = 0;
		}
	};
}])

.factory('HelperService', function() {
	return {
		timeToMilli: function(time) {
			var hours = parseInt(time.hour1 + time.hour2),
			    mins  = parseInt(time.min1 + time.min2);

			return (hours * 3600000) + (mins * 6000);
		},
		timeToUnix: function(time) {
			var time = this.timeToMilli(time);

			return Math.floor(new Date().getTime() + time);
		}
	};
})

.factory('FormService', ['$location', 'FlashService', function($location, FlashService) {
	var formData;

	return {
		checkValid: function(input) {
			var input = input || {};

			if (input.task && input.limit && input.limitUnix) {
				FlashService.clear();
				formData = input;

				return true;
			}
			FlashService.show({
				'task':       !!input.task,
				'time limit': !!input.limit
			});

			return false;
		},
		startCountdown: function(input) {
			$location.path('/countdown');
		},
		getFormData: function() {
			return formData;
		}
	};
}])

// .factory('TimerService', ['', function() {

// }])

// .factory('CountdownService', ['', function() {

// }])

// .factory('CandCService', ['', function() {

// }])
