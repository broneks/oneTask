(function() {
	'use strict';

	angular
		.module('YHOJcontrollers', [
			'YHOJservices'
		])
		.controller('startscreenCtrl', startscreenCtrl)
		.controller('countdownCtrl', countdownCtrl)
		.controller('failCtrl', failCtrl)
		.controller('congratsCtrl', congratsCtrl);


	startscreenCtrl.$inject = ['$scope', 'FormService', 'HelperService']; 

	function startscreenCtrl($scope, FormService, HelperService) {
		$scope.timeLimit = {
			hour1: '0',
			hour2: '0',
			min1 : '0',
			min2 : '0'
		};
		$scope.task = '';

		if (FormService.isStorageSet()) {
			FormService.startTask();
		}

		$scope.submit = function() {
			var input = {
						task : $scope.task,
						limit: HelperService.timeToMilli($scope.timeLimit),
						limitUnix: HelperService.timeToUnix($scope.timeLimit)
					},
					valid = FormService.validate(input);

			if (valid) {
				FormService.startTask(input);
			}
		};
	}


	countdownCtrl.$inject = ['$scope', '$location', '$timeout', 'CountdownService']; 

	function countdownCtrl($scope, $location, $timeout, CountdownService, timer) {
		var countdownData = CountdownService.getInputData();

		if (!countdownData) {
			$location.path('/');
		}

		$scope.input = countdownData;
		$scope.timerRunning = true;
		
		$scope.startTimer = function() {
			$scope.$broadcast('timer-start');
			$scope.timerRunning = true;
		};
		
		$scope.stopTimer = function() {
			$scope.$broadcast('timer-stop');
			$scope.timerRunning = false;
		};

		$scope.cancel = function() {
			$scope.stopTimer();
			CountdownService.cancelTask();
			$location.path('/');
		};

		$scope.finished = function(event) {
			var redirectPath = '/fail';

			CountdownService.finishTask();
			$scope.stopTimer();

			// user clicked "completed"
			if (event && event.type === 'click') {
				redirectPath = '/congrats';
			}

			$timeout(function() {
				$location.path(redirectPath);
			});
		};
	}


	congratsCtrl.$inject = ['$scope', '$location', 'ResultService']; 

	function congratsCtrl($scope, $location, ResultService) {
		if (ResultService.allSystemsGo()) {
			$scope.heading = 'Congratulations!';
			$scope.result = 'views/congrats/' + ResultService.getRandomResult('congrats') + '.html';
		} else {
			$location.path('/');
		}
	}


	failCtrl.$inject = ['$scope', '$location', 'ResultService'];

	function failCtrl($scope, $location, ResultService) {
		if (ResultService.allSystemsGo()) {
			$scope.heading = 'Fail...';
			$scope.result = 'views/fail/' + ResultService.getRandomResult('fail') + '.html';
		} else {
			$location.path('/');
		}
	}
})();