angular.module('YHOJcontrollers', ['YHOJservices'])

.controller('startscreenCtrl', ['$scope', 'FormService', function($scope, FormService) {
	$scope.timeLimit = {
		hour1: 0,
		hour2: 0,
		min1 : 0,
		min2 : 0
	};

	$scope.submit = function() {
		var valid = FormService.checkValid({
			task: $scope.task,
			limit: FormService.timeToSeconds($scope.timeLimit)
		});

		if (valid) {
			console.log('valid');
		} else {
			jQuery('html, body').animate({ scrollTop: 0 }, 'easeOutQuart');
		}
	};
}])

.controller('countdownCtrl', ['$scope', function($scope) {

}])

.controller('congratsCtrl', ['$scope', function($scope) {

}])

.controller('failCtrl', ['$scope', function($scope) {

}])