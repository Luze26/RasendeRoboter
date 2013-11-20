angular.module('loggedApp').constant('gameConstants', {"login": angular.element('#login').val(),"idGame": angular.element('#idGame').val()});

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
		game.startCountdown(data.FinalCountdown);
	});
	
	socket.on('TerminateGame', function(data) {
		game.finishGame();
	});

	socket.on('solutions', function(data) {
		game.refreshRanks(data.solutions);
	});
	
	socket.on('participants', function(data) {
		game.refreshParticipants(data.participants);
	});
}]);

/**
 * @ngdoc object
 * @name loggedApp.controller:mapController
 *
 * @description
 * Handle map and robot behaviours.
 */
angular.module('loggedApp').controller("mapController", ["$scope", "$http", "game", 'HOST_URL', 'propositionService', '$timeout', function($scope, $http, game, HOST_URL, propositionService, $timeout) {

	$scope.game = game;
	
	var resizeMap = function() {
		var table = angular.element('table');
		var width = table.width();
		var height = width/16 - 4;
		angular.element('tr').height(height);
		robots = angular.element('.robot');
		height -= 4;
		robots.height(height);
		robots.width(height);
		
		var overlay = angular.element('.map-overlay');
		overlay.width(width);
		overlay.height(table.height());
	};
	
	window.onresize = resizeMap;
	
	//Init everything
	$http.get(HOST_URL + "/" + game.idGame).success(function(data) {
			game.init(data);
			$timeout(resizeMap, 200);
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
	$scope.$parent.keyPress = function(event) {
		switch(event.which) {
			case 40: //DOWN
				game.move('DOWN');
				break;
			case 38: //UP
				game.move('UP');
				break;
			case 37: //LEFT
				game.move('LEFT');
				break;
			case 39: //RIGHT
				game.move('RIGHT');
				break;
			case 32: //SPACEBAR, SWITCH ROBOT
				var robotToSelect;
				if(!game.selectedRobot) {
					robotToSelect = game.robots[0];
				}
				else {
					var index = game.robots.indexOf(game.selectedRobot);					
					var nbRobots = game.robots.length;
					(index == nbRobots-1) ? index = 0 : index++;
					while(!game.robots[index].canMove(game.lastRobotMoved)) {
						if(index == nbRobots-1) {
							index = -1;
						}
						index++;
					}
					robotToSelect = game.robots[index];
				}
				game.selectRobot(robotToSelect);
				break;
		}
	};
}]);