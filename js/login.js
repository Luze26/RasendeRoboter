function init() {
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('gamesList', function(data) {
        
        var div = document.getElementById('lesParties');
        div.innerHTML='';
        
        for(g in data.gamesList) {
            var button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.classList.add('btn');
            button.classList.add('btn-default');
            
            // Fill the input text when you click on a game
            button.onclick = function() { 
                var game = data.gamesList[g];
                return function() {
                    document.getElementById('idGame').value = game;
					document.getElementById('idConnexion').click();
                }
            }();
            
            div.appendChild(button);
            button.appendChild( document.createTextNode(data.gamesList[g]));
        }
    });
	socket.emit('loginPage');
}