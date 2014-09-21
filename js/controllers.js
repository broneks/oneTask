angular.module('YHOJcontrollers', ['YHOJservices'])

.controller('startscreenCtrl', ['$scope', 'FormService', 'HelperService', function($scope, FormService, HelperService) {
	$scope.timeLimit = {
		hour1: '0',
		hour2: '0',
		min1 : '0',
		min2 : '0'
	};
	// $scope.task = 'test';

	$scope.submit = function() {
		var input = {
				task : $scope.task,
				limit: HelperService.timeToMilli($scope.timeLimit),
				limitUnix: HelperService.timeToUnix($scope.timeLimit)
			},
			valid = FormService.checkValid(input);

		if (valid) {
			FormService.startCountdown();
		} else {
			jQuery('html, body').animate({ scrollTop: 0 }, 'easeOutQuart');
		}
	};

	// $scope.submit();
}])

.controller('countdownCtrl', ['$scope', 'FormService', function($scope, FormService) {
	$scope.input = FormService.getFormData();
}])

// .controller('congratsCtrl', ['$scope', function($scope) {

// }])

// .controller('failCtrl', ['$scope', function($scope) {

// }])
