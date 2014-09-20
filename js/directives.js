angular.module('YHOJdirectives', [])

.directive('timePicker', function() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/timepicker.html',
		link: function(scope, element, attributes) {
			scope.updateTimepicker = function(context, direction) {
				if (!context && !direction) return;

				var time = scope.timeLimit;

				direction === 'increase' ? time[context]++ : time[context]--;

				switch(context) {
					case 'hour1':
					case 'hour2':
					case 'min2':
						if      (time[context] > 9) time[context] = 0;
						else if (time[context] < 0) time[context] = 9; 
						break;

					case 'min1':
						if      (time.min1 > 5) time.min1 = 0;
						else if (time.min1 < 0) time.min1 = 5; 
						break;
				}
			};
		}
	};
})

.directive('infoHelp', function() {
	return {
		restrict: 'E',
		scope: {
			linkLabel: '@linkLabel'
		},
		transclude: true,
		template: '<a href="" class="info" ng-click="toggleDetails()">{{ linkLabel }}</a><div class="details" ng-class="{ \'active\': active }" ng-transclude></div>',
		link: function(scope, element, attributes) {
			scope.active = false;

			scope.toggleDetails = function() {
				if (scope.active) scope.active = false;
				else {
					scope.active = true;
					jQuery('html, body').animate({ scrollTop: $(window).height() + $(document).height() }, 'easeOutQuart');
				}
			};
		}
	};
})

