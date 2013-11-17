var commonModule = angular.module('commonModule', []);

/**
 * @ngdoc object
 * @name commonModule.constant:HOST_URL
 *
 * @description
 * Server's url
 */
commonModule.constant('HOST_URL', window.location.origin);

/**
 * @ngdoc service
 * @name commonModule.service:socket
 *
 * @description
 * socket.io service. Open a socket shared between controllers.
 */
commonModule.factory('socket', ['$rootScope', function ($rootScope) {
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
      });
    }
  };
}]);