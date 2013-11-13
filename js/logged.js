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
loggedApp.constant('HOST_URL', 'http://localhost:8090');

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
loggedApp.factory('propositionService', function($http, gameInfo) {
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
			url: 'http://localhost:8090/proposition',
			method: 'POST',
			data: encodeURI(data),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}

		});
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

loggedApp.factory('gameInfo', function () {
  var infos = {};
  
  infos.login = angular.element('#login').val();
  infos.idGame = angular.element('#idGame').val();

  return infos;
});

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

loggedApp.controller("participantsController", ["$scope", "socket", function($scope, socket) {
	$scope.participants = [];
	socket.on('participants', function(data) {
		$scope.participants = data.participants;
	});
}]);

loggedApp.controller("mapController", ["$scope", "$http", "gameInfo", 'HOST_URL', 'propositionService', function($scope, $http, gameInfo, HOST_URL, propositionService) {

	$http.get(HOST_URL + "/" + gameInfo.idGame).success(function(data) {
			//Init map
			$scope.map = data.board;
			
			//Init robots
			var robots = data.robots;
			$scope.nbRobots = robots.length;
			for(var i = 0; i < $scope.nbRobots; i++) {
				var robot = robots[i];
				$scope.map[robot.line][robot.column].robot = robot;
			}
			$scope.robots = robots;
			
			//Init target
			var target = data.target;
			$scope.map[target.l][target.c].target = target.t;
		});
	
	$scope.selectRobot = function(robot) {
		if($scope.selectedRobot != robot) {
			propositionService.doAction("select", robot.color);
			if($scope.selectedRobot) {
				$scope.selectedRobot.selected = false;
			}
			$scope.selectedRobot = robot;
			robot.selected = true;
		}
	};
	
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
	
	function isOnTarget(robot) {
		return $scope.map[robot.line][robot.column].target == robot.color;
	}
	
	$scope.$parent.keyPress = function(event) {
		switch(event.which) {
			case 40: //DOWN
				$scope.move($scope.moveRobotDown, $scope.selectedRobot);
				break;
			case 38: //UP
				$scope.move($scope.moveRobotUp, $scope.selectedRobot);
				break;
			case 37: //LEFT
				$scope.move($scope.moveRobotLeft, $scope.selectedRobot);
				break;
			case 39: //RIGHT
				$scope.move($scope.moveRobotRight, $scope.selectedRobot);
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
	
	$scope.move = function(moveRobot, robotToMove) {
		if(robotToMove) {
			if(moveRobot(robotToMove)) {
				$scope.move(moveRobot, robotToMove);
			}
			else {
				propositionService.doAction("move", null, robotToMove.line, robotToMove.column);
				if(isOnTarget(robotToMove)) {
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