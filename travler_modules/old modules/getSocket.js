var desktopSocket = false;
exports.getSocket = function(){
	return desktopSocket || {
		emit: noSocketWarning,
		on: noSocketWarning,
		noSocket:true
	};
}
exports.setSocket = function(socket){
	desktopSocket = socket;
}

function noSocketWarning(){
	console.trace('WARNING: Tried to access socket while not connected');
};