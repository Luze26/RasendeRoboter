/**
 * @ngdoc overview
 * @name loggedApp
 *
 * @description
 * Used on the page reach when login in.
 */
var loggedApp = angular.module("loggedApp", ['commonModule']);

/**
 * @ngdoc service
 * @name loggedApp.service:propositionService
 *
 * @description
 * Proposition service. Used to register actions constituting the proposition, and send the proposition.
 */
loggedApp.factory('propositionService', ['$http', 'gameInfo', 'HOST_URL', function($http, gameInfo, HOST_URL) {
	var service = {};
	
	/**
	 * Array of actions, formatted according what except the server
	 */
	service.proposition = [];
	
	/**
	 * @ngdoc function
	 * @name loggedApp.service:propositionService#sendProposition
	 * @methodOf loggedApp.service:propositionService
	 *
	 * @description
	 * Send the proposition to the server.
	 *
	 * @returns {promise} promise for the request used to send the proposition
	 */
	service.sendProposition = function() {
		var data = 'login=' + gameInfo.login + '&idGame=' + gameInfo.idGame + '&proposition=' + JSON.stringify(service.proposition);
		
		return $http({
			url: HOST_URL + '/proposition',
			method: 'POST',
			data: encodeURI(data),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}

		});
	};

	/**
	 * @ngdoc function
	 * @name loggedApp.service:propositionService#reset
	 * @methodOf loggedApp.service:propositionService
	 *
	 * @description
	 * Reset the proposition.
	 */
	service.reset = function() {
		service.proposition = [];
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.service:propositionService#doAction
	 * @methodOf loggedApp.service:propositionService
	 *
	 * @description
	 * Record the last action (add it to the proposition).
	 *
	 * @param {string} cmd The command of the action ("select" | "move")
	 * @param {string} color Robot's color (used only if the command is "select", must be null otherwise)
	 * @param {int} line The destination line (must be set only if the command is move)
	 * @param {int} column The destination column (must be set only if the command is move)
	 */	
	service.doAction = function(cmd, color, line, column) {
		var action = {"command": cmd};
		if(cmd == "select") {
			action.robot = color;
		}
		else {
			action.line = line;
			action.column = column;
		}
		service.proposition.push(action);
	};
	
	return service;
}]);

/**
 * @ngdoc service
 * @name loggedApp.service:gameInfo
 *
 * @description
 * Used to retrieve information put in hidden input field.
 */
loggedApp.factory('gameInfo', function () {
  var infos = {};
  
  //User login
  infos.login = angular.element('#login').val();
  
  //Game id
  infos.idGame = angular.element('#idGame').val();

  return infos;
});

/**
 * @ngdoc object
 * @name loggedApp.controller:mainController
 *
 * @description
 * Main controller used to catch key events.
 */
loggedApp.controller("mainController", ["$scope", "socket", "gameInfo", "$timeout", function($scope, socket, gameInfo, $timeout) {
	socket.emit ('identification', {login: gameInfo.login, idGame: gameInfo.idGame});
	
	$scope.firstFinder = "Un joueur";
	$scope.player = gameInfo.login;
	
	var countDown = function() {
		$scope.countDown--;
		if($scope.countDown > 0) {
			$timeout(countDown, 1000);
		}
	};
	
	socket.on('FinalCountDown', function(data) {
		var ms   = data.FinalCountDown;
		$scope.countDown = ms/1000;
		countDown();
	});
	
	socket.on('TerminateGame', function(data) {
	console.log("tg"); console.log(data);
		$scope.terminateGame = true;
	});
		
	socket.on('solutions', function(data) {
	console.log("solution"); console.log(data);
		$scope.firstFinder = data.solutions[0].player;
	});
		
	
	
}]);

/**
 * @ngdoc object
 * @name loggedApp.controller:participantsController
 *
 * @description
 * Handle the list of participants
 */
loggedApp.controller("participantsController", ["$scope", "socket", function($scope, socket) {
	$scope.participants = [];
	socket.on('participants', function(data) {
		$scope.participants = data.participants;
	});
}]);

/**
 * @ngdoc object
 * @name loggedApp.controller:mapController
 *
 * @description
 * Handle map and robot behaviours.
 */
loggedApp.controller("mapController", ["$scope", "$http", "gameInfo", 'HOST_URL', 'propositionService', '$timeout', function($scope, $http, gameInfo, HOST_URL, propositionService, $timeout) {

	var originalData;
	
	var resizeMap = function() {
		var table = angular.element('table');
		var width = table.width();
		var height = width/16 - 4;
		angular.element('.cell').height(height);
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
	$http.get(HOST_URL + "/" + gameInfo.idGame).success(function(data) {
			originalData = JSON.parse(JSON.stringify(data));
			init(data);
			$timeout(resizeMap, 200);
	});
	
	$scope.gameName = gameInfo.idGame;
	
	var init = function(data) {
		$scope.game = {};

		//Init map
		$scope.game.map = data.board;
		$scope.game.map.maxLine = $scope.game.map.length;
		$scope.game.map.maxColumn = $scope.game.map[0].length;
		
		//Init robots
		var nbRobots = data.robots.length;
		$scope.game.robots = [];
		for(var i = 0; i < nbRobots; i++) {
			var robot = data.robots[i];
			$scope.game.robots.push( new Robot(robot.column, robot.line, robot.color, $scope.game.map));
		}
		$scope.game.selectedRobot = null;
		$scope.game.lastRobotMoved = null;
		
		//Init target
		var target = data.target;
		$scope.game.map[target.l][target.c].target = target.t;
		
		//Init game status
		$scope.gameStatus = "Running";
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#reset
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Reset everything.
	 */
	$scope.reset = function() {
		propositionService.reset();
		var data = JSON.parse(JSON.stringify(originalData));
		init(data);
		$timeout(resizeMap, 50);
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#selectRobot
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Unselect the current selected robot and select the given one. The selection is recorded in the proposition only after the first move of the robot.
	 *
	 * @param {Robot} robot Robot to be selected
	 */
	$scope.selectRobot = function(robot) {
		if(!$scope.$parent.terminateGame && $scope.game.selectedRobot != robot) { //If the robot isn't already selected
			if(robot.canMove($scope.game.lastRobotMoved)) {
				if($scope.game.selectedRobot) {
					$scope.game.selectedRobot.selected = false;
				}
				$scope.game.selectedRobot = robot;
				robot.selected = true;
			}
		}
	};
		
	$scope.move = function(direction) {
		if(!$scope.$parent.terminateGame) {
			var robotToMove = $scope.game.selectedRobot;
			var alreadyMoved = robotToMove.moved;

			if(robotToMove && robotToMove.canMove($scope.game.lastRobotMoved)) { //Check if the robot can be moved
				var moved = robotToMove.move(direction, true);
				if(moved) { //If the robot has actually moved
					$scope.game.lastRobotMoved = robotToMove;
					
					if(!alreadyMoved && moved) { //If it's first move, we also register the select
						propositionService.doAction("select", robotToMove.color);
					}
					propositionService.doAction("move", null, robotToMove.line, robotToMove.column);
					
					if(robotToMove.isOnTarget()) { //If the proposition is valid => send the proposition => display the result
						var req = propositionService.sendProposition();
						req.success(function(result) {
						console.log(result);
								switch(result.state) {
									case "SUCCESS":
										$scope.victory = true;
										$scope.$parent.terminateGame = true;
										break;
									case "TOO_LATE":
										$scope.tooLate = true;
										$scope.$parent.terminateGame = true;
										break;
									default:
										$scope.error = true;
										break;
								}
							}).error(function() {
								//TODO connection error
							});
					}
				}
			}
		}
	};
	
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
				$scope.move('DOWN');
				break;
			case 38: //UP
				$scope.move('UP');
				break;
			case 37: //LEFT
				$scope.move('LEFT');
				break;
			case 39: //RIGHT
				$scope.move('RIGHT');
				break;
			case 32: //SPACEBAR, SWITCH ROBOT
				var robotToSelect;
				if(!$scope.game.selectedRobot) {
					robotToSelect = $scope.game.robots[0];
				}
				else {
					var index = $scope.game.robots.indexOf($scope.game.selectedRobot);					
					var nbRobots = $scope.game.robots.length;
					(index == nbRobots-1) ? index = 0 : index++;
					while(!$scope.game.robots[index].canMove($scope.game.lastRobotMoved)) {
						if(index == nbRobots-1) {
							index = -1;
						}
						index++;
					}
					robotToSelect = $scope.game.robots[index];
				}
				$scope.selectRobot(robotToSelect);
				break;
		}
	};
}]);