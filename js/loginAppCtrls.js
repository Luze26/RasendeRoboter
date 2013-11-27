
/**
 * @ngdoc object
 * @name loggedApp.controller:mainController
 *
 * @description
 * Main controller used to catch key events.
 */
angular.module('loginApp').controller("mainController", ['$http', 'HOST_URL', "$scope", "socket", function($http, HOST_URL, $scope, socket, $location) {

	socket.on('gamesList', function(data) {
        $scope.gamesList = data.gamesList;
    });
          
          
    $scope.game = {idGame:"", login:""};
    
    $scope.loginKO = {display:false, text:"Vous n'avez renseigné votre nom d'utilisateur."};
    $scope.idGameKO = {display:false, text:"Vous n'avez renseigné le nom de votre partie."};

    $scope.join = function() {
        if ($scope.game.login != "" && $scope.game.idGame != "") {
            document.getElementById('idGame').value = $scope.game.idGame;
            document.getElementById('login').value = $scope.game.login;
            document.getElementById('newGame').submit();
        } else {
            $scope.loginKO.display = $scope.game.login === "";
            $scope.idGameKO.display = $scope.game.idGame === ""; 
        }
    }
    
    $scope.select = function(game) {
        $scope.game.idGame = game;
        $scope.join();
    };
            
	socket.emit('loginPage');
}]);