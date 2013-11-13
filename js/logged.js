var loggedApp = angular.module("loggedApp", []);

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

loggedApp.constant('HOST_URL', 'http://localhost:8090');

loggedApp.factory('gameInfo', function () {
  var infos = {};
  
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

loggedApp.controller("mapController", ["$scope", "$http", "gameInfo", 'HOST_URL', function($scope, $http, gameInfo, HOST_URL) {
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
		});
		
	$scope.selectRobot = function(robot) {
		if($scope.selectedRobot) {
			$scope.selectedRobot.selected = false;
		}
		$scope.selectedRobot = robot;
		robot.selected = true;
	};
	
	
	
	$scope.moveDown = function() {
		if($scope.selectedRobot) {
			var robotToMove = $scope.selectedRobot;
			var currentCell = $scope.map[robotToMove.line][robotToMove.column];
			
			if(robotToMove.line < $scope.map.length && currentCell.b != 1) {
				var nextCell = $scope.map[robotToMove.line+1][robotToMove.column];
				if(nextCell.robot == null && nextCell.h != 1) {
					currentCell.robot = null;
					robotToMove.line++;
					nextCell.robot = robotToMove;
					$scope.moveDown();
				}
			}
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
	
	$scope.move = function(moveRobot, robotToMove) {
		if(robotToMove) {
			if(moveRobot(robotToMove)) {
				$scope.move(moveRobot, robotToMove);
			}
		}
	};
}]);