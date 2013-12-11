var RasendeRoboter = function() {return {
	  dataPlateau : [ [{g:1, h:1}, {h:1}, {h:1}, {h:1}	, {h:1}	, {h:1,d:1}	, {h:1}		, {h:1}	, {h:1,d:1}	, {h:1}	, {h:1}		, {h:1}	, {h:1}	, {h:1}		, {h:1} , {h:1,d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {}		, {}	, {}		, {d:1}	, {b:1}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {b:1}, {}	, {}	, {}	, {}		, {}		, {}	, {}		, {}	, {}		, {}	, {}	, {g:1}		, {} 	, {d:1}]
					, [{g:1}	 , {g:1}, {}	, {}	, {}	, {}		, {}		, {}	, {}		, {}	, {}		, {d:1}	, {h:1}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {b:1,d:1}	, {}	, {}		, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1,b:1}]
					, [{g:1,b:1} , {}	, {b:1}	, {}	, {}	, {}		, {}		, {d:1}	, {b:1}		, {}	, {}		, {}	, {}	, {b:1}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {d:1}	, {b:1}	, {}	, {}		, {}		, {}	, {}		, {}	, {}		, {}	, {}	, {d:1}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {d:1}		, {h:1}	, {h:1,d:1}	, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {d:1}		, {b:1}	, {b:1,d:1}	, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {d:1}, {b:1}	, {}	, {}	, {}		, {}		, {}	, {}		, {}	, {b:1,d:1}	, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {d:1}	, {}	, {}	, {}		, {}		, {}	, {}		, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {d:1}		, {h:1}	, {}		, {}	, {}		, {}	, {h:1}	, {g:1,b:1}	, {} 	, {d:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {}		, {}		, {}	, {}		, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1,h:1} , {}	, {}	, {}	, {}	, {}		, {}		, {}	, {d:1}		, {h:1}	, {}		, {}	, {}	, {}		, {} 	, {d:1,h:1}]
					, [{g:1}	 , {}	, {}	, {}	, {}	, {b:1,d:1}	, {}		, {}	, {}		, {}	, {}		, {}	, {}	, {}		, {} 	, {d:1}]
					, [{g:1,b:1}, {b:1}	, {b:1}	, {b:1}	, {b:1}	, {b:1}		, {b:1,d:1}	, {b:1}	, {b:1}		, {b:1}	, {b:1,d:1}	, {b:1}	, {b:1}	, {b:1}		, {b:1} , {d:1,b:1}]
					]
	, cibles: 	[ {l:1,c:10,t:'red'}
				, {l:2,c:12,t:'blue'}
				, {l:3,c:1,t:'red'}
				, {l:3,c:12,t:'green'}
				, {l:4,c:6,t:'yellow'}
				, {l:5,c:8,t:'red'/*'white'*/}
				, {l:6,c:2,t:'green'}
				, {l:6,c:3,t:'blue'}
				, {l:6,c:13,t:'yellow'}
				, {l:9,c:2,t:'yellow'}
				, {l:9,c:10,t:'yellow'}
				, {l:10,c:2,t:'green'}
				, {l:11,c:7,t:'blue'}
				, {l:11,c:12,t:'red'}
				, {l:11,c:13,t:'green'}
				, {l:13,c:9,t:'blue'}
				, {l:14,c:5,t:'red'}
				]
	, cible		: null
	, robots	: []
	, init: function(idTable) {
		 // Choisir une cible au hasard
		 this.cible = Math.floor( Math.random()*this.cibles.length );
		 // Placer les robots au hasard
		 var robots = ['blue', 'red', 'green', 'yellow'];
		 for(var i in robots) {
			 var l = c = 7;
			 do {
				 l = Math.floor( Math.random()*16 )
				 c = Math.floor( Math.random()*16 );
				 if(l>=7 && l<=8 && c>=7 && c<=8) continue;
				 if( this.cibles[this.cible].l == l
				   &&this.cibles[this.cible].c == c) continue;
				 var samePlace = false;
				 for(var robot in this.robots) {
					 if( this.robots[robot].line   == l
					   &&this.robots[robot].column == c) {samePlace = true; break;}
					}
				 if(!samePlace) {break;}
				} while(true);
			 this.robots.push( {color: robots[i], line:l, column:c} );
			}
		 return this;
		}
	, getConfiguration	: function () {
		 return { board		: this.dataPlateau
				, target	: this.cibles[ this.cible ]
				, robots	: this.robots
				};
		}
	, NoRobot : function(robots, line, column) {
		 for(r in robots) {
			 if( robots[r].line   == line
			   &&robots[r].column == column ) {return false;}
			}
		 return true;
		}
	, getNextPositionsFrom: function(robots, line, column) {
		 // console.log("getNextPositionsFrom " +line+" "+column);
		 var nexts = [], l, c;
		 // Go left
		 l = line; c = column;
		 while( this.dataPlateau[l][c].g   == undefined
		      &&this.dataPlateau[l][c-1].d == undefined
			  &&this.NoRobot(robots, l, c-1) ) c--;
		 if(c != column) {nexts.push({l:line, c:c});}
		 // Go right
		 l = line; c = column;
		 while( this.dataPlateau[l][c].d   == undefined
		      &&this.dataPlateau[l][c+1].g == undefined
			  &&this.NoRobot(robots, l, c+1) ) c++;
		 if(c != column) {nexts.push({l:line, c:c});}
		 // Go top
		 l = line; c = column;
		 while( this.dataPlateau[l][c].h   == undefined
		      &&this.dataPlateau[l-1][c].b == undefined
			  &&this.NoRobot(robots, l-1, c) ) l--;
		 if(l != line) {nexts.push({l:l, c:column});}
		 // Go down
		 l = line; c = column;
		 while( this.dataPlateau[l][c].b   == undefined
		      &&this.dataPlateau[l+1][c].h == undefined
			  &&this.NoRobot(robots, l+1, c) ) l++;
		 if(l != line) {nexts.push({l:l, c:column});}
		 // Results
		 return nexts;
		}
	, isAmong: function(position, positions) {
		 for(var p in positions) {
			 if( position.l == positions[p].l
			   &&position.c == positions[p].c ) {return true;}
			}
		 return false;
		}
	, ProcessProposition : function(proposition) {
		 var state = '', details = ''
		   , nextPositions = [];
		 // state : {INVALID_EMPTY, INVALID_SELECT, INVALID_MOVE, INCOMPLETE, SUCCESS}
		 // nextPositions : list of possible next positions for the last moved robots
		 // Copy robot positions
		 var P = {}
		   , currentRobot = null;
		 for(var r in this.robots) {P[this.robots[r].color] = {line: this.robots[r].line, column: this.robots[r].column, color: this.robots[r].color};}
		 // Go through the proposition
		 for(var i=0; i<proposition.length && state==''; i++) {
			 switch(proposition[i].command) {
				 case 'select':
					if(P[ proposition[i].robot ] == undefined) {throw new Error({error: 'INVALID_ROBOT', detail: proposition[i].robot+' is not a robot, should be blue, red, yellow or green'});}
					if(P[ proposition[i].robot ].selected && currentRobot != P[ proposition[i].robot ]) {
						 state = "INVALID_SELECT"; details = 'You can not move again a robot after having released it'; break;
						} else 	{currentRobot = P[proposition[i].robot];
								 currentRobot.selected = true;
								}
				 break;
				 case 'move':
					if(currentRobot == null) {state = 'INVALID_MOVE'; details = 'You have to select a robot before move'; break;}
					var nexts = this.getNextPositionsFrom(P, currentRobot.line, currentRobot.column);
					if(this.isAmong({l:proposition[i].line, c:proposition[i].column}, nexts)) {
						 currentRobot.line 	 = proposition[i].line;
						 currentRobot.column = proposition[i].column;
						} else	{state   = 'INVALID_MOVE';
								 details = 'Robot must move along a column or a line until it meet another robot or a wall.';
								}
				 break;
				 default:
					var details = 'Invalide command at index ' + i + ' of the proposition : ' + proposition[i].command + "\n\tShould be 'select' or 'move' as a value of 'command' attribute.";
					throw new Error({error: 'INVALID_SUBCOMMAND', detail: details});
				}
			}
		 if(currentRobot == null) {state = 'INVALID_EMPTY'; details = 'A proposition can not be empty';}
		 if(state == '') { // Proposition is valid. If incomplete then send back next possible movement for last selected robot
			 // console.log("Cible et robot");
			 // console.log("\t"+currentRobot.color+' == '+this.cibles[ this.cible ].t);
			 // console.log("\t"+currentRobot.line  == this.cibles[ this.cible ].l
			 // console.log("\t"+
			 if( currentRobot.color == this.cibles[ this.cible ].t
			   &&currentRobot.line  == this.cibles[ this.cible ].l
			   &&currentRobot.column == this.cibles[ this.cible ].c ) {
					 state = 'SUCCESS';
					 
					} else 	{state = 'INCOMPLETE';
							 nextPositions = this.getNextPositionsFrom(P, currentRobot.line, currentRobot.column);
							}
			}
		 return {state: state, details: details, nextPositions: nextPositions};
		}
};
};

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
//mongoose.connect('mongodb://mongoUser:mongoUser19455605,@ds057568.mongolab.com:57568/heroku_app19455605');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	var User = mongoose.model('User', {name: String, password: String, email: String, played: Number, win: Number, finish: Number});
	var dbManager = {};
	
	dbManager.connectUser = function(name, password, callback) {
		User.findOne({'name': name}, function(err, user) {
			if(user !== null) {
				if(user.password && user.password !== password) {
					callback(null);
				}
				else {
					var update = { played: user.played + 1 };
					if(!user.password && !!password) {
						update.password = password;
					}
					User.findByIdAndUpdate(user.id, { $set: update}, function (err, user) {
						if(err) {
							console.log(err);
						}
						else {
							callback(user);
						}
					});
				}
			}
			else {
				if(!password || password == "undefined") {
					password = "";
				}
				var user = new User({name: name, password: password, email: "", played: 1, win: 0, finish: 0});
				user.save(function(err, user) {
					if(err) {
						console.log(err);
					}
					else {
						callback(user);
					}
				});
			}
		});
	};
	
	dbManager.getTopPlayers = function(limit, callback) {
		User.find().limit(limit).sort('-win').sort('-finish').sort('-played').sort('+name').exec(
			function(err, players) {
				if(err) {
					console.log(err);
				}
				else {
					callback(players);
				}
			});
	};
	
	dbManager.finish = function(name) {
		User.findOne({'name': name}, function(err, user) {
			if(user !== null) {
				User.findByIdAndUpdate(user.id, { $set: { finish: user.finish + 1 }}, function (err, user) {
					if(err) {
						console.log(err);
					}
				});
			}
		});
	};
	
	dbManager.win = function(name) {
		User.findOne({'name': name}, function(err, user) {
			if(user !== null) {
				User.findByIdAndUpdate(user.id, { $set: { win: user.win + 1 }}, function (err, user) {
					if(err) {
						console.log(err);
					}
				});
			}
		});
	};
	
	dbManager.checkPlayer = function(name, password, callback) {
		User.findOne({'name': name}, function(err, user) {
			if(user !== null && !!user.password && user.password !== password) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	};
	
	var port = process.env.PORT || 8090;
	console.log("Listening on port " + port);
	RRServer.init(port, dbManager);
});

var RRServer = {
	  fs		: require('fs')
	, express	: require('express')
	, app		: null
	, io		: require('socket.io')	
	, games		: { list	: {}
				  , ProcessProposition : function(idGame, playerName, proposition) {
								 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID' );}
								 if(this.list[idGame].participants[playerName] == undefined) {throw new Error( 'PLAYER_IS_NOT_PRESENT' );}
								 if(this.list[idGame].Terminated) {return {state: 'TOO_LATE', details: 'The game is over...', nextPositions:[]};}
								 var answer = this.list[idGame].game.ProcessProposition( proposition );
								 if(answer.state == 'SUCCESS') {
									 if(this.list[idGame].finalCountDown) {
										 RRServer.games.OtherFinalProposition(idGame, playerName, proposition);
										} else	{RRServer.games.FinalCountDown(idGame, playerName, proposition);
												}
									}
								 return answer;
								}
				  , new		: function(id)	{//console.log('Opening game ' + id);
								 if(this.list[id]) {throw new Error( 'NOT_UNIQUE_ID');}
								 this.list[id] = {ms: 60000, participants:{}, propositions:[], game: (new RasendeRoboter()).init()}
								 setTimeout( function() {RRServer.games.checkParticipants(id);}, 5000);
								 RRServer.sendGamesInfo();
								}
				  , close	: function(id)	{//console.log('Closing game ' + id);
								 if(this.list[id] == undefined) {throw new Error( 'NO_SUCH_GAME_ID');}
								 delete this.list[id];
								 RRServer.sendGamesInfo();
								}
				  , joining	: function(idGame, playerName) {
								 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID' );}
								 if(this.list[idGame].participants[playerName] == undefined) {
									 //console.log("\tParticipant " + playerName + ' is joining game ' + idGame);
									 this.list[idGame].participants[playerName] = {name:playerName, sockets: new Array()};
									}
								 RRServer.sendGamesInfo();
								}
				  , leaving	: function(idGame, playerName) {
								 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID' );}
								 if(this.list[idGame].participants[playerName] == undefined) {throw new Error( 'PLAYER_IS_NOT_PRESENT' );}
								 //console.log("\tPlayer " + playerName + ' is leaving game ' + idGame);
								 delete this.list[idGame].participants[playerName];
								 this.sendListOfParticipants(idGame);
								 setTimeout( function() {RRServer.games.checkParticipants(idGame);}, 5000);
								 RRServer.sendGamesInfo();
								}
				  , checkParticipants : function(idGame) {//console.log("\tcheckParticipants");
								 if(this.list[idGame] == undefined) {return;}
								 var nb=0; 
								 for(i in this.list[idGame].participants) {
									 //console.log("\t\tConsidering participant " + i + ' with ' + this.list[idGame].participants[i].sockets.length + ' sockets');
									 if(this.list[idGame].participants[i].sockets.length > 0) {nb++;}
									}
								 if(nb==0) {this.close(idGame);}
								}
				  , identification	: function(idGame, playerName, socket) {
								 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID' );}
								 if(this.list[idGame].participants[playerName] == undefined) {
									 this.joining(idGame, playerName);
									}
								 //console.log("\tParticipant " + playerName + " is connected on game " + idGame + " using socket " + socket.id);
								 this.list[idGame].participants[playerName].sockets.push(socket);
								 this.sendListOfParticipants(idGame);
								}
				  , disconnect	: function(socket) {
								 for(var idGame in this.list) {
									 for(var playerName in this.list[idGame].participants) {
										 var i = this.list[idGame].participants[playerName].sockets.indexOf(socket);
										 if(i >= 0) {
											 this.list[idGame].participants[playerName].sockets.splice(i, 1);
											 if(this.list[idGame].participants[playerName].sockets.length == 0) {
												 this.leaving(idGame, playerName);
												}
											}
										}
									}
								}
				  , emit: function(idGame, variable, value, targets) {
								 targets = targets || this.list[idGame].participants;
								 // Inform all participants that the list of participants has changed
								 for(var p in targets) {
									 for(var sock in this.list[idGame].participants[p].sockets) {
										 this.list[idGame].participants[p].sockets[sock].emit(variable, value);
										}
									}
								}
				  , sendListOfParticipants: function(idGame) {
								 // List all participants
								 var participants = [];
								 for (var p in this.list[idGame].participants) {participants.push( p );}
								 this.emit(idGame, 'participants', {participants: participants});
								}
				  , FinalCountDown: function(idGame, playerName, proposition) {
						 this.list[idGame].finalCountDown = true;
						 this.list[idGame].solutions = [];
						 var ms = this.list[idGame].ms;
						 this.emit(idGame, 'FinalCountDown', {FinalCountDown: ms});
						 this.OtherFinalProposition(idGame, playerName, proposition);
						 var clearIntervalId = setInterval(function() {if(RRServer.games.list[idGame]) { RRServer.games.list[idGame].ms-=1000; } else { clearInterval(clearIntervalId); }}, 1000);
						 setTimeout	( function() {
								clearInterval(clearIntervalId);
								if(RRServer.games.list[idGame]) {
									RRServer.games.list[idGame].ms = -1;
									RRServer.games.TerminateGame(idGame);
								}
							}, ms );
						 RRServer.sendGamesInfo();
						}
				  , OtherFinalProposition: function(idGame, playerName, proposition) {
						 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID');}
						 RRServer.dbManager.finish(playerName);
						 this.list[idGame].solutions.push( {player: playerName, proposition: proposition} );
						 this.emit(idGame, 'solutions', {solutions: this.list[idGame].solutions});
						}
				  , TerminateGame: function(idGame) {
						 if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID');}
						if(this.list[idGame] == undefined) {throw new Error( 'NO_SUCH_GAME_ID');}
						if(this.list[idGame].solutions) {
							RRServer.dbManager.win(this.list[idGame].solutions[0].player);
						}
						var nextGame = idGame + Math.floor(Math.random()*100000);
						this.list[idGame].nextGame = nextGame;
						this.emit(idGame, 'TerminateGame', {TerminateGame: true, NextGame: nextGame});
						this.list[idGame].Terminated = true;
						RRServer.sendGamesInfo();
					}
				  }
	, sockets	: [] // Sockets connected to the loggin page
	, connect	: function(socket) {//console.log("Connection on loggin page of " + socket.id);
		 if(this.sockets.indexOf(socket) < 0) {
			 this.sockets.push( socket );
			}
		 this.sendGamesInfo( [socket] );
		}
	, disconnect: function(socket) {//console.log("Disonnection of loggin page of " + socket.id);
		 var i = this.sockets.indexOf(socket);
		 if(i >= 0) {
			 this.sockets.splice(i, 1);
			}
		 this.games.disconnect(socket);
		}
	, sendGamesInfo	: function(sockets) {//console.log("--> Sending game informations");
		 sockets = sockets || this.sockets;
		 // Build the game list
		 var gamesList = [];
		 //for(var g in this.games.list) {gamesList.push(g);}
		 for(var g in this.games.list) {
			var i = 0;
			for(var p in this.games.list[g].participants) {
				i++;
			}
			var itemToAdd = {gameName: g, gameParticipants: i, gameTerminate: this.games.list[g].Terminated};
			gamesList.push(itemToAdd);
		 }
		 // Send it to all connected login pages
		 for(var i in sockets) {
			 sockets[i].emit( 'gamesList', {gamesList: gamesList});
			}
			this.dbManager.getTopPlayers(10, function(players) {
				for(var i in sockets) {
					sockets[i].emit( 'topPlayers', {players: players});
				}
			});
		}
	, init		: function(port, dbManager) {
		this.dbManager = dbManager;
		this.app	= this.express().use(this.express.static(__dirname))
									.use(this.express.bodyParser())
									.get('/', function(req, res) {
										RRServer.fs.readFile(__dirname + '/login.html',
												  function (err, data) {
													if (err) {res.writeHead(500);
															  return res.end('Error loading login.html'); }
													res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                                                    var numRobot = Math.floor((Math.random()*19)+1);
                                                    res.write( data.toString().replace(/__ROBOT__/g, numRobot));
                                                    res.end();
												  });
										})
									.post('/checkPlayer', function(req, res) {
										if(RRServer.games.list[req.body.idGame]) {
											if(RRServer.games.list[req.body.idGame].participants[req.body.login]) {
												res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
												return res.end("Un joueur avec ce pseudo est déjà dans cette partie");
											}
										}
										RRServer.dbManager.checkPlayer(req.body.login, req.body.password, function(ok) {
											if(ok) {
												res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
												res.end();
											}
											else {
												res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
												return res.end("Mot de passe incorrect");
											}
										});
										RRServer.dbManager
									})
									.post('/', function(req, res) {
										// POST VARIABLES :
										//	- login
										//	- idGame
												// Create or join the idGame
										try {RRServer.games.joining(req.body.idGame, req.body.login);
											} catch(err) {switch(err.message) {
															 case 'NO_SUCH_GAME_ID':
																RRServer.games.new(req.body.idGame);
																RRServer.games.joining(req.body.idGame, req.body.login);
																break;
															 case 'PLAYER_ALREADY_PRESENT':
																res.writeHead(500);
																return res.end('Player '+req.body.login+' is already logged into game '+req.body.idGame+'...');
																break;
															 default:
																console.log("Error while joining game:\n" + err);
																break;
															}
														 }
										RRServer.fs.readFile(__dirname + '/logged.html',
											function (err, data) {
												if (err) {res.writeHead(500);
														  return res.end('Error loading logged.html');}
												
												var title = req.body.idGame
												  , state = '', numRobot = Math.floor((Math.random()*19)+1);
												
												var generatePage = function(user) {
													if(user !== null) {
														res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
														res.write( data.toString().replace(/__USER__/g	, encodeURIComponent(JSON.stringify(user)))
																				  .replace(/__IDGAME__/g, title)
																				  .replace(/__ROBOT__/g, numRobot)
																 );
														res.end();
													}
													else {
														res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
														res.end();
													}
												}
												
												RRServer.dbManager.connectUser(req.body.login, req.body.password, generatePage);
											  });
											
										})
									.use(function(req, res) {
										 if(req.method == "GET") {
											 // Is there a game with that URL ?
											 var idGame = req.url.slice(1);
											 if( RRServer.games.list[ idGame ] ) {
												 res.writeHead(200, {'Content-Type': 'application/json'});
												 res.end( JSON.stringify({"game": RRServer.games.list[ idGame ].game.getConfiguration(), "solutions": RRServer.games.list[ idGame ].solutions,
													"ms": RRServer.games.list[ idGame ].ms, "nextGame": RRServer.games.list[ idGame ].nextGame}) );
												 return;
												}
											 res.writeHead(404);
											 res.write('Ressource does not exists, should be one of : ');
											 for(var game in RRServer.games.list) {
												 res.write( game + ' ');
												}
											 res.end('.');
											}
										 if(req.method == "POST") {
											 // Is it a proposition of solution?
											 var REST_command = req.url.slice(1);
											 // console.log("Receiving a proposition :");
											 switch(REST_command) {
												 case 'proposition':
													var answer = null;
													// for(var i in req.body) {console.log("\t"+i+' : '+req.body[i]);}
													try {answer = RRServer.games.ProcessProposition( req.body.idGame
																									   , req.body.login
																									   , JSON.parse( req.body.proposition ) );
														}
													catch(err) {
														 switch(err.message) {
															 case 'NO_SUCH_GAME_ID':
																RRServer.games.new(req.body.idGame);
																RRServer.games.joining(req.body.idGame, req.body.login);
																break;
															 case 'PLAYER_IS_NOT_PRESENT':
																RRServer.games.joining(req.body.idGame, req.body.login);
																break;
															 default:
																console.error("Error while processing proposition :\n" + err.detail );
																res.writeHead(400);
																res.end( JSON.stringify(err.detail) );
																return;
															}
														 answer = RRServer.games.ProcessProposition( req.body.idGame
																								   , req.body.login
																								   , JSON.parse( req.body.proposition ) );
														}
													res.writeHead(200, {'Content-Type': 'application/json'});
													res.end( JSON.stringify( answer ) );
												 break;
												}
											}
										})
									.listen(port) ;
			 this.io	= this.io.listen( this.app, { log: false } );

			 this.io.on	('connection', function (socket) {
										  socket.on	( 'loginPage'
													, function(data) {
														 // console.log("Someone is connected on the loggin page...");
														 RRServer.connect( socket );
														}			
													);
										  socket.on	( 'identification'
													, function(data) {
														 // console.log('Received identification ' + JSON.stringify(data));
														 RRServer.games.identification(data.idGame, data.login, socket);
														}
													);
										  socket.on	( 'disconnect'
													, function() {RRServer.disconnect( socket );}
													);
										}
					);
		}
};

