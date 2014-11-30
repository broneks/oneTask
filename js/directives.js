(function(){
	'use strict';

	angular
		.module('YHOJdirectives', [])
		.directive('progressBar', progressBar)
		.directive('timePicker', timePicker)
		.directive('infoHelp', infoHelp);


	function progressBar() {
		
		var directive = {
			restrict: 'E',
			template: '<div class="progress-outer"><div class="progress-bar" ng-style="barStyle"></div></div>',
			controller: ctrl
		};

		return directive;

		function ctrl($scope, $timeout) {
			var bg, barFilled;

			$scope.barStyle = {};

			$timeout(function() {
				$scope.$on('timer-tick', function(event, args) {
					barFilled = (args.millis / $scope.input.limit) * 100;

				    if      (barFilled > 50)                    bg = '#2ecc71';
				    else if (barFilled <= 50 && barFilled > 30) bg = '#f1c40f';
				    else if (barFilled <= 30 && barFilled > 10) bg = '#f39c12';
				    else if (barFilled <= 10)                   bg = '#e74c3c';

					$scope.barStyle = {'width': barFilled + '%', 'background-color': bg};
					
					$scope.$apply();
				});
			});
		};
	}


	function timePicker() {
		
		var directive = {
			restrict: 'E',
			templateUrl: 'partials/timepicker.html',
			controller: ctrl 
		};

		return directive;

		function ctrl($scope) {
			$scope.updateTimepicker = function(context, direction) {
				if (!context && !direction) return;

				var time = $scope.timeLimit;

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
		};
	}


	function infoHelp() {
		
		var directive = {
			restrict: 'E',
			scope: {
				linkLabel: '@linkLabel'
			},
			transclude: true,
			template: '<a href="" class="info" ng-click="toggleDetails()">{{ linkLabel }}</a><div class="details" ng-class="{ \'active\': active }" ng-transclude></div>',
			controller: ctrl
		};

		return directive;

		function ctrl($scope) {
			$scope.active = false;

			$scope.toggleDetails = function() {
				if ($scope.active) {
					$scope.active = false;
				}
				else {
					$scope.active = true;
					jQuery('html, body').animate({ scrollTop: $(window).height() + $(document).height() }, 'easeOutQuart');
				}
			};
		};
	}
})();