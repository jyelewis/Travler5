var callbacks = {};

exports.getScreenSize = function(cb){
	var cbID = makeID(5);
	callbacks[cbID] = cb;
	socket.emit('getScreenSize', cbID);
};
socket.on('getScreenSize', function(cbID, size){
	callbacks[cbID](size);
	delete(callbacks[cbID]);
});