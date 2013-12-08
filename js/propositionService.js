/**
 * @ngdoc service
 * @name loggedApp.service:propositionService
 *
 * @description
 * Proposition service. Used to register actions constituting the proposition, and send the proposition.
 */
angular.module('loggedApp').factory('propositionService', ['$http', 'HOST_URL', 'gameConstants', function($http, HOST_URL, gameConstants) {
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
		var data = 'login=' + gameConstants.user.name + '&idGame=' + gameConstants.idGame + '&proposition=' + JSON.stringify(service.proposition);
		
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