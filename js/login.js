function init() {
	// Connect to the SocketIO server to retrieve ongoing games.
	socket = io.connect();
	socket.on('gamesList', function(data) {
								var div = document.getElementById('lesParties');
								div.innerHTML='';
								for(p in data.gamesList) {
									var button = document.createElement('button');
									button.setAttribute('type', 'button');
									button.classList.add('btn');
									button.classList.add('btn-default');
									div.appendChild(button);
									button.appendChild( document.createTextNode(data.gamesList[p]));
								}
							}
			 );
	socket.emit('loginPage');
}


