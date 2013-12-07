angular.module('loggedApp').factory('game', ['$http', 'HOST_URL', '$timeout', 'propositionService', 'gameConstants', function($http, HOST_URL, $timeout, propositionService, gameConstants) {
	var service = {};
	
	//User login
	service.login = gameConstants.login;
	//Game id
	service.idGame = gameConstants.idGame;
	
	///////////
	//Countdown
	///////////
	
	service.countDown = null;
	
	var countDown = function() {
		service.countDown--;
		if(service.countDown > 0) {
			$timeout(countDown, 1000);
		}
	};
	
	service.startCountdown = function(ms) {
		service.finalCountDown = true;
		service.countDown = ms/1000;
		countDown();
	};
	
	
	///////////
	//Finish Game
	///////////
	
	//If a proposition has been done
	service.propositionDone = false;
	
	//Terminate game, if the game is terminate
	service.terminateGame = false;
	
	service.finishGame = function(nextGame) {
		service.terminateGame = true;
		service.countDown = 0;
		service.nextGame = nextGame;
		service.isWinner = false;
		service.participants.forEach(function(participant) {
			if(participant.place == 1) {
				service.isCurrentPlayerWinner = participant.name == service.login;
				service.winner = participant;
				return;
			}
		});
	};
	
	///////////
	//Participants
	///////////
	
	//Participants list
	var participantsHash = {};
	service.currentPlayer = {name: service.login, place: "~", me: true};
	participantsHash[service.login] = service.currentPlayer;
	service.participants = [participantsHash[service.login]];
	
	//First finder, first finder to have proposed a valid solution
	service.firstFinder = "Un joueur";
	
	service.refreshRanks = function(solutions) {
		if(solutions) {
			service.firstFinder = solutions[0].player; //First finder
			
			solutions.forEach(function(solution, i) {
				var current = solution.player;
				if(!participantsHash[current]) {
					participantsHash[current] = {name: current, place: "~", me: false, nbCoups: null};
					service.participants.push(participantsHash[current]);
				}
				var nbCoups = solution.proposition.length;
				var place = 1;
				solutions.forEach(function(solution2, j) {
					if(solution2.player != current && (solution2.proposition.length < nbCoups || solution2.proposition.length == nbCoups && i > j)) {
						place++;
					}
				});
				participantsHash[current].place = place;
				participantsHash[current].nbCoups = nbCoups;
			});
		}
	};
	
	service.refreshParticipants = function(participants) {
		var participantsTmp = [];
		participants.forEach(function(participant) {
			if(!participantsHash[participant]) {
				participantsHash[participant] = {name: participant, place: "~", me: service.login == participant, nbCoups: null};
				service.participants.push(participantsHash[participant]);
			}
		});
	};
	
	///////////
	//Initialization
	///////////
		
	var originalRobots;
	service.selectedRobot = null;
	service.lastRobotMoved = null;
		
	var initRobots = function(robots, reset) {
		if(reset !== true) {
			service.robots = [];
		}
		
		//Init robots
		var nbRobots = robots.length;
		for(var i = 0; i < nbRobots; i++) {
			var robot = robots[i];
			if(reset === true) {
				service.robots[i].reset(robot.column, robot.line);
			}
			else {
				service.robots.push(new Robot(robot.column, robot.line, robot.color, service.map));
			}
		}
		
		service.selectedRobot = null;
		service.lastRobotMoved = null;
	};
	
	service.init = function(data) {		
		//Init map
		service.map = data.game.board;
		var maxLine = data.game.board.length;
		service.map.maxLine = maxLine;
		var maxCol = data.game.board[0].length;
		service.map.maxColumn = maxCol;
		
		originalRobots = JSON.parse(JSON.stringify(data.game.robots));
		initRobots(data.game.robots);		
		
		//Init target
		var target = data.game.target;
		service.map[target.l][target.c].target = target.t;
		if(data.solutions) {
			if(data.ms > 0) {
				service.startCountdown(data.ms);
			}
			else {
				service.tooLate = true;
				service.nextGame = data.nextGame;
				service.finishGame();
			}
			service.refreshRanks(data.solutions);
		}
	};
	
	service.reset = function() {
		if(!service.terminateGame && !service.propositionDone) {
			propositionService.reset();
			var nbRobots = service.robots.length;
			for(var i = 0; i < nbRobots; i++) {
				var robot = service.robots[i];
				if(robot.moved === true) {
					service.map[robot.line][robot.column].robot = null;
				}
			}
			
			var robots = JSON.parse(JSON.stringify(originalRobots));
			initRobots(robots, true);
		}
	};
	
	///////////
	//Actions
	///////////
	
	/**
	 * @ngdoc function
	 * @name loggedApp.service:gameService#selectRobot
	 * @methodOf loggedApp.service:gameService
	 *
	 * @description
	 * Unselect the current selected robot and select the given one. The selection is recorded in the proposition only after the first move of the robot.
	 *
	 * @param {Robot} robot Robot to be selected
	 */
	service.selectRobot = function(robot) {
		if(!service.terminateGame && !service.propositionDone && service.selectedRobot != robot) { //If the robot isn't already selected
			if(robot.canMove(service.lastRobotMoved)) {
				if(service.selectedRobot) {
					service.selectedRobot.unselect();
				}
				service.selectedRobot = robot;
				robot.select();
			}
		}
	};
	
	service.move = function(direction) {
		if(!service.terminateGame && !service.propositionDone && service.selectedRobot) {
			var robotToMove = service.selectedRobot;
			var alreadyMoved = robotToMove.moved;

			if(robotToMove && robotToMove.canMove(service.lastRobotMoved)) { //Check if the robot can be moved
				var moved = robotToMove.move(direction, true);
				if(moved) { //If the robot has actually moved
					service.lastRobotMoved = robotToMove;
					
					if(!alreadyMoved && moved) { //If it's first move, we also register the select
						propositionService.doAction("select", robotToMove.color);
					}
					propositionService.doAction("move", null, robotToMove.line, robotToMove.column);
					
					if(robotToMove.isOnTarget()) { //If the proposition is valid => send the proposition => display the result
						var req = propositionService.sendProposition();
						service.propositionDone = true;
						req.success(function(result) {
								switch(result.state) {
									case "SUCCESS":
										service.propositionSuccess = true;
										break;
									case "TOO_LATE":
										service.tooLate = true;
										service.terminateGame = true;
										break;
									default:
										service.error = true;
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
	
	service.selectNext = function() {
		if(!service.selectedRobot) {
			service.selectRobot(service.robots[0]);
		}
		else {
			var index = service.robots.indexOf(service.selectedRobot);					
			var nbRobots = service.robots.length;
			(index == nbRobots-1) ? index = 0 : index++;
			while(!service.robots[index].canMove(service.lastRobotMoved)) {
				if(index == nbRobots-1) {
					index = -1;
				}
				index++;
			}
			service.selectRobot(service.robots[index]);
		}
	};
	
	return service;
}]);