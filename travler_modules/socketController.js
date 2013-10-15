var io;
var connect = require('connect');
var express = require('express');
//var appManager = useModule('appManager');
//var windowManager = useModule('windowManager');
//var launcherManager = useModule('launcherManager');
//var getSocket = useModule('getSocket');
var loginManager = useModule('loginManager');

var sockets = new Array();

exports.configure = function(server, sessionStore) {
	var socketio = require('socket.io').listen(server, {log:false});
	//var cookieParser = express.cookieParser('pofqui23py49823hf');
	//io = new SessionSockets(socketio, sessionStore, cookieParser);
	//io.on('connection', function(err, socket, session){
	var studioTimeout;
	socketio.on('connection', function(socket){
		
		//var machineID = socket.handshake.signedCookies.travlerMachineID;
		//var machineID = socket.id;
		if(socket.id){
			sockets[socket.id] = socket;
		}
		socket.on('disconnect', function(){
			sockets[socket.id] = null;
		});
		socket.on('error', function(error){
			throw new Error('Client error: ' + error);
		});
		
		socket.on('username', function(username){
			loginManager.setup(username, socket);
		});
		
		//socket logic here
		/*var user = useModule('user')(socket.id);
		
		//it needs to know which page to start up to
		socket.emit('page.show', 'login');

		//to authenticate, then send and show the desktop information
		socket.on('auth.check', function(data){
			if(user.checkPassword(data.password)){
				user.authenticate();
				bindAll(socket.id, socket); //were logged in and ready to go
			} else {
				setTimeout(function(){
					socket.emit('auth.check.fail');
				}, 500);
			}
		});*/
		//end socket logic
	});
}

/*function bindAll(socketID, socket){
	var oldSocket = getSocket.getSocket()
	if(!oldSocket.noSocket){
		oldSocket.emit('kick');
	}
	socket.on('disconnect', function(){
		if(getSocket.getSocket() === socket){ //make sure that we arent overwriting a new socket
			getSocket.setSocket(false);
		}
	});
	getSocket.setSocket(socket);
	
	//setup the required functions / run their inits;
	var user = useModule('user')(socketID);
	var desktop = useModule('desktop').desktop(socketID, socket);
	
	desktop.setup(); //user can login, show and setup the desktop
	
	//for when you're franticly looking for them later the desktop sockets
	//are stored in the /logic/desktop.js file, triggered by desktop.setup
};
*/
exports.socketByID = function(socketID){
	return sockets[socketID];
}