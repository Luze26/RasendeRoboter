
/**
 * @ngdoc object
 * @name loggedApp.controller:mainController
 *
 * @description
 * Main controller used to catch key events.
 */
angular.module('loginApp').controller("mainController", ['$http', 'HOST_URL', "$scope", "socket", function($http, HOST_URL, $scope, socket, $location) {
              
    $scope.game = {idGame:"", login:""};
    
    $scope.displayCreationField = false;
    $scope.displayGameSelection = false;
    $scope.displayContainer = false; // Enforse socket init before display
    
    $scope.loginKO = {display:false, text:"Vous n'avez pas renseigné votre nom d'utilisateur."};
    $scope.idGameKO = {display:false, text:"Vous n'avez pas renseigné le nom de votre partie."};

	$scope.initGamesListClass = function() {
		$scope.gamesListClass = [];
		for(var i = 0; i < $scope.gamesList.length; i++) {
			$scope.gamesListClass.push("notOver");
		}
	}
    
	socket.on('gamesList', function(data) {
        $scope.gamesList = data.gamesList;
        $scope.initGamesListClass();
		
        if($scope.gamesList.length == 0) {
            $scope.displayCreationField = true;
            $scope.displayGameSelection = false;
        } else {
            $scope.displayGameSelection = true;
        }
        
        $scope.displayContainer = true;
    });

    socket.on('topPlayers', function(data) {
        $scope.topPlayers = data.players;
    });
	
    $scope.join = function() {
        if ($scope.game.login != "" && $scope.game.idGame != "") {
            document.getElementById('idGame').value = $scope.game.idGame;
            document.getElementById('login').value = $scope.game.login;
			document.getElementById('password').value = $scope.game.password;
			$http.post(HOST_URL + "/checkPlayer", $scope.game).success(function() {
				document.getElementById('newGame').submit();
			})
			.error(function(error) {
				console.log(error);
			});
        } else {
            $scope.loginKO.display = $scope.game.login === "";
            $scope.idGameKO.display = $scope.game.idGame === ""; 
        }
    }
    
    $scope.showCreationField = function() {
        $scope.displayCreationField = true;
    }
    
    $scope.select = function(game) {
        $scope.game.idGame = game;
        $scope.join();
    };
	
	$scope.mouseEnter = function(numGame) {
		$scope.initGamesListClass();
		$scope.gamesListClass[numGame] = "over";
		if((numGame-1) >= 0 && ((numGame-1) % 3) != 0 ||(numGame-1) == 0) {
			var tmp = numGame - 1;
			$scope.gamesListClass[tmp] = "nextToOver";
		}
		
		if((numGame+1) < $scope.gamesListClass.length && ((numGame+1) % 4) != 0) {
			var tmp = numGame + 1;
			$scope.gamesListClass[tmp] = "nextToOver";
		}
	}
	
	$scope.mouseLeave = function(numGame) {
		//sleep(1);
		if($scope.gamesListClass[numGame] === "over") {
			$scope.initGamesListClass();
		}
	}
            
	socket.emit('loginPage');
}]);