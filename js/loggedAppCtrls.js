angular.module('loggedApp').constant('gameConstants', {"user": JSON.parse(decodeURIComponent(angular.element('#user').val())),"idGame": angular.element('#idGame').val()});

/**
 * @ngdoc object
 * @name loggedApp.controller:mainController
 *
 * @description
 * Main controller used to catch key events.
 */
angular.module('loggedApp').controller("mainController", ["$scope", "socket", "game", function($scope, socket, game) {
	socket.emit ('identification', {login: game.login, idGame: game.idGame});
	
	$scope.game = game;
	
	socket.on('FinalCountDown', function(data) {
		game.startCountdown(data.FinalCountDown);
	});
	
	socket.on('TerminateGame', function(data) {
		game.finishGame(data.NextGame);
	});

	socket.on('solutions', function(data) {
		game.refreshRanks(data.solutions);
	});
	
	socket.on('participants', function(data) {
		game.refreshParticipants(data.participants);
	});
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mainController#keyPress
	 * @methodOf loggedApp.controller:mainController
	 *
	 * @description
	 * Called when a key is pressed. Handle keys actions on the game.
	 *
	 * @param {event} event key event
	 */
	$scope.keyPress = function(event) {
		switch(event.which) {
			case 40: //DOWN
				game.move('DOWN');
				event.preventDefault();
				break;
			case 38: //UP
				game.move('UP');
				event.preventDefault();
				break;
			case 37: //LEFT
				game.move('LEFT');
				event.preventDefault();
				break;
			case 39: //RIGHT
				game.move('RIGHT');
				event.preventDefault();
				break;
			case 32: //SPACEBAR, SWITCH ROBOT
				game.selectNext();
				event.preventDefault();
				break;
			case 8: //BACKSPACE, RESET
				game.reset();
				event.preventDefault();
				break;
		}
	};
}]);

angular.module('loggedApp').directive('styleCellDirective', function() {
  return function(scope, element, attrs) {
    var cell = scope.cell;
	var classToAdd = [];
	if(cell.g == 1) {
		classToAdd.push("cell-border-left ");
	}
	if(cell.d == 1) {
		classToAdd.push("cell-border-right ");
	}
	if(cell.h == 1) {
		classToAdd.push("cell-border-top ");
	}
	if(cell.b == 1) {
		classToAdd.push("cell-border-bottom ");
	}
	if(cell.target != null) {
		classToAdd.push("target-");
		classToAdd.push(cell.target);
	}
	angular.element(element).addClass(classToAdd.join(''));
	if(scope.$last) {
		window.onresize();
	}
  };
});

/**
 * @ngdoc object
 * @name loggedApp.controller:mapController
 *
 * @description
 * Handle map and robot behaviours.
 */
angular.module('loggedApp').controller("mapController", ["$scope", "$http", "game", 'HOST_URL', 'propositionService', '$timeout', function($scope, $http, game, HOST_URL, propositionService, $timeout) {

	$scope.game = game;
	
	var overlay = angular.element('.map-overlay');
	var table = angular.element('table');
	var lines = null;
	
	var resizeMap = function() {
		if(lines === null) {
			lines = table.find('tr');
		}
		
		var width = table.width();
		var height = width/16 - 4;
		lines.height(height);
		height -= 4;

		$timeout(function() {
			Robot.prototype.height = height;
			Robot.prototype.width = height;
		});
		
		overlay.width(width);
		overlay.height(table.height());
	};
	
	window.onresize = resizeMap;
	
	//Init everything
	$http.get(HOST_URL + "/" + game.idGame).success(function(data) {
		game.init(data);
	});
	
	$scope.clickCell = function(cell) {
		if(cell.endpoint != null) {
			game.move(cell.endpoint);
		}
	};
	
	var table = angular.element('#tableWrap');
	table.swipe( {
        swipe:function(event, direction, distance, duration, fingerCount) {
			if(direction && distance > 15) {
				game.move(direction.toUpperCase());
				$scope.$apply();
			}
        },
		tap:function(event) {
        },
		doubleTap:function() {
			$scope.$apply(function() {
				game.selectNext();
			});
        },
        threshold:0
      });
}]);