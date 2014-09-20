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
	
})

.factory('FormService', ['FlashService', function(FlashService) {
	return {
		checkValid: function(input) {
			var input = input || {};

			if (input.task && input.limit) {
				FlashService.clear();
				return true;
			}
			FlashService.show({
				'task':       !!input.task,
				'time limit': !!input.limit
			});
			return false;
		},
		timeToSeconds: function(time) {
			var hours = parseInt(time.hour1 + time.hour2),
			    mins  = parseInt(time.min1 + time.min2);

			    console.log(hours * 3600 + mins * 60);

			return hours * 3600 + mins * 60;
		}
	};
}])

.factory('TimerService', ['', function() {

}])

.factory('CountdownService', ['', function() {

}])

.factory('CandCService', ['', function() {

}])
