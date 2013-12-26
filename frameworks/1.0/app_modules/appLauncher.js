var callbacks = {};

exports.startApp = function(path, callback){
	callbacks[path] = callback;
	socket.emit('appStart', path);
};

socket.on('appLaunched', function(err, path, pid){
	if(callbacks[path]){
		setTimeout(function(){
			callbacks[path](err, pid);
		}, 100);
	}
});

exports.killApp = function(pid){
	socket.emit('appKill', pid);
};

exports.launchApp = function(pid){
	socket.emit('appLaunch', pid);
};