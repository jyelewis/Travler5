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
	socketio.on('connection', function(socket){
		if(socket.id){
			sockets[socket.id] = socket;
		}
		socket.on('disconnect', function(){
			sockets[socket.id] = null;
		});
		
		socket.on('username', function(username){
			loginManager.setup(username, socket);
		});
	});
}


exports.socketByID = function(socketID){
	return sockets[socketID];
}