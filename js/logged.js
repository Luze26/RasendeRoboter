/**
 * @ngdoc overview
 * @name loggedApp
 *
 * @description
 * Used on the page reach when login in.
 */
var loggedApp = angular.module("loggedApp", []);

/**
 * @ngdoc object
 * @name loggedApp.constant:HOST_URL
 *
 * @description
 * Server's url
 */
loggedApp.constant('HOST_URL', window.location.origin);

/**
 * @ngdoc service
 * @name loggedApp.service:socket
 *
 * @description
 * socket.io service. Open a socket shared between controllers.
 */
loggedApp.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

/**
 * @ngdoc service
 * @name loggedApp.service:propositionService
 *
 * @description
 * Proposition service. Used to register actions constituting the proposition, and send the proposition.
 */
loggedApp.factory('propositionService', function($http, gameInfo, HOST_URL) {
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
	}

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
	}
	
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
	}
	
	return service;
});

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
loggedApp.controller("mainController", ["$scope", "socket", function($scope, socket) {
	socket.on('FinalCountDown'	, function(data) {
		 var ms   = data.FinalCountDown;
		 console.log("FinalCountDown : " + ms);
		});
	socket.on('TerminateGame'	, function(data) {
		 h1 = document.querySelector('body > header > h1');
		 h1.innerHTML += ' est terminée !';
		});
	socket.on('solutions'		, function(data) {
		 console.log("Solutions are :\n"+JSON.stringify(data.solutions));
		});
	socket.emit ('identification', 	{ login	: document.getElementById('login').value
									, idGame: document.getElementById('idGame').value}
				);
	
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
loggedApp.controller("mapController", ["$scope", "$http", "gameInfo", 'HOST_URL', 'propositionService', function($scope, $http, gameInfo, HOST_URL, propositionService) {

	var originalGame;
	
	//Init everything
	$http.get(HOST_URL + "/" + gameInfo.idGame).success(function(data) {
	console.log(data);
			//Init map
			originalGame = data;
			$scope.init();
		});
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#init
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Init everything, also usedc to reset.
	 */
	$scope.init = function() {
		$scope.selectedRobot = null;
		
		var copyOriginalGame = JSON.parse(JSON.stringify(originalGame));
		$scope.map = copyOriginalGame.board;
		
		//Init robots
		var robots = copyOriginalGame.robots;
		$scope.nbRobots = robots.length;
		for(var i = 0; i < $scope.nbRobots; i++) {
			var robot = robots[i];
			$scope.map[robot.line][robot.column].robot = robot;
		}
		$scope.robots = robots;
		
		//Init target
		var target = copyOriginalGame.target;
		$scope.map[target.l][target.c].target = target.t;
		
		propositionService.reset();
		
		$scope.victory = false;
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
		if($scope.selectedRobot != robot) {
			if($scope.selectedRobot) {
				$scope.selectedRobot.selected = false;
			}
			$scope.selectedRobot = robot;
			robot.selected = true;
		}
	};
	
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#moveRobotUp
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Move the robot to the upper cell
	 *
	 * @param {robot} robotToMove Robot to move
	 * @returns {boolean} true if the robot has been moved, false if the action is impossible
	 */
	$scope.moveRobotUp = function(robotToMove) {
		var currentCell = $scope.map[robotToMove.line][robotToMove.column];
		if(robotToMove.line > 0 && currentCell.h != 1) {
			var nextCell = $scope.map[robotToMove.line-1][robotToMove.column];
			if(nextCell.robot == null && nextCell.b != 1) {
				currentCell.robot = null;
				robotToMove.line--;
				nextCell.robot = robotToMove;
				return true;
			}
		}
		return false;
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#moveRobotDown
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Move the robot to the bottom cell
	 *
	 * @param {robot} robotToMove Robot to move
	 * @returns {boolean} true if the robot has been moved, false if the action is impossible
	 */
	$scope.moveRobotDown = function(robotToMove) {
		var currentCell = $scope.map[robotToMove.line][robotToMove.column];
		if(robotToMove.line < $scope.map.length && currentCell.b != 1) {
			var nextCell = $scope.map[robotToMove.line+1][robotToMove.column];
			if(nextCell.robot == null && nextCell.h != 1) {
				currentCell.robot = null;
				robotToMove.line++;
				nextCell.robot = robotToMove;
				return true;
			}
		}
		return false;
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#moveRobotLeft
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Move the robot to the left cell
	 *
	 * @param {robot} robotToMove Robot to move
	 * @returns {boolean} true if the robot has been moved, false if the action is impossible
	 */
	$scope.moveRobotLeft = function(robotToMove) {
		var currentCell = $scope.map[robotToMove.line][robotToMove.column];
		if(robotToMove.column > 0 && currentCell.g != 1) {
			var nextCell = $scope.map[robotToMove.line][robotToMove.column-1];
			if(nextCell.robot == null && nextCell.d != 1) {
				currentCell.robot = null;
				robotToMove.column--;
				nextCell.robot = robotToMove;
				return true;
			}
		}
		return false;
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#moveRobotRight
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Move the robot to the right cell
	 *
	 * @param {robot} robotToMove Robot to move
	 * @returns {boolean} true if the robot has been moved, false if the action is impossible
	 */
	$scope.moveRobotRight = function(robotToMove) {
		var currentCell = $scope.map[robotToMove.line][robotToMove.column];
		if(robotToMove.column < $scope.map[0].length && currentCell.d != 1) {
			var nextCell = $scope.map[robotToMove.line][robotToMove.column+1];
			if(nextCell.robot == null && nextCell.g != 1) {
				currentCell.robot = null;
				robotToMove.column++;
				nextCell.robot = robotToMove;
				return true;
			}
		}
		return false;
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#isOnTarget
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * If the right robot is on the target.
	 *
	 * @param {robot} robot Robot to check
	 * @returns {boolean} true if the robot is on the target, false otherwise
	 */
	function isOnTarget(robot) {
		return $scope.map[robot.line][robot.column].target == robot.color;
	}
	
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
				$scope.move($scope.moveRobotDown, $scope.selectedRobot, true);
				break;
			case 38: //UP
				$scope.move($scope.moveRobotUp, $scope.selectedRobot, true);
				break;
			case 37: //LEFT
				$scope.move($scope.moveRobotLeft, $scope.selectedRobot, true);
				break;
			case 39: //RIGHT
				$scope.move($scope.moveRobotRight, $scope.selectedRobot, true);
				break;
			case 32: //SPACEBAR, SWITCH ROBOT
				var robotToSelect;
				if(!$scope.selectedRobot) {
					robotToSelect = $scope.robots[0];
				}
				else {
					var index = $scope.robots.indexOf($scope.selectedRobot);
					index++;
					if(index >= $scope.robots.length) {
						index = 0;
					}
					robotToSelect = $scope.robots[index];
				}
				$scope.selectRobot(robotToSelect);
				break;
		}
	};
	
	/**
	 * @ngdoc function
	 * @name loggedApp.controller:mapController#move
	 * @methodOf loggedApp.controller:mapController
	 *
	 * @description
	 * Move a robot until it hits something. At the end of the move, checks if the proposition is valid, if
	 * so, send the proposition to the server and display the result.
	 *
	 * @param {function} moveRobot Function to execute to move the robot
	 * @param {robot} robotToMove Robot to move
	 * @param {boolean} If it's the first call
	 */
	$scope.move = function(moveRobot, robotToMove, firstCall) {
		if(robotToMove) { //If there is a robot to move
			if(moveRobot(robotToMove)) { //Continues to move while it's possible
				if(!robotToMove.moved) { //If it's the first move of the robot, we memorized that, and record the selection
					robotToMove.moved = true;
					propositionService.doAction("select", robotToMove.color);
				}
				$scope.move(moveRobot, robotToMove);
			}
			else if(!firstCall) { //If the robot can't move anymore, the movement is done except if it's the first call, we check if the proposition is valid.
				propositionService.doAction("move", null, robotToMove.line, robotToMove.column);
				if(isOnTarget(robotToMove)) { //If the proposition is valid => send the proposition => display the result
					var req = propositionService.sendProposition();
					req.success(function(result) {
							switch(result.state) {
								case "SUCCESS":
									$scope.victory = true;
									break;
								case "TOO_LATE":
									//TODO
								default:
									//TODO
							}
						}).error(function() {
							//TODO connection error
						});
				}
			}
		}
	};
}]);