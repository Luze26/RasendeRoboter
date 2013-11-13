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
			$scope.map = data.board;
		});
}]);