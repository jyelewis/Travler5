

function forwardSocket(socketa, socketb){
	socketa._socket.on('INTERFACE.'+socketa.key, function(socketObj){
		socketb._socket.emit('INTERFACE.'+socketb.key, socketObj);
	});
	socketb._socket.on('INTERFACE.'+socketb.key, function(socketObj){
		socketa._socket.emit('INTERFACE.'+socketa.key, socketObj);
	});
	
}