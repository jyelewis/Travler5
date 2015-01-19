var callbacks = {};

exports.startApp = function(path, callback){
	callbacks[path] = callback;
	app.fwSocket.emit('appStart', path);
};

app.fwSocket.on('appLaunched', function(err, path, pid){
	if(callbacks[path]){
		setTimeout(function(){
			callbacks[path](err, pid);
		}, 100);
	}
});

exports.killApp = function(pid){
	app.fwSocket.emit('appKill', pid);
};

exports.launchApp = function(pid){
	app.fwSocket.emit('appLaunch', pid);
};

exports.onAppRelaunch = function(pid, cb){
	callbacks["rl"+pid] = cb;
};

app.fwSocket.on('appRelaunched', function(oldPid, newPid){
	if(callbacks["rl"+oldPid]){
		callbacks["rl"+oldPid](newPid);
		//reassign the callback to the new listener and delete the old one
		callbacks["rl"+newPid] = callbacks["rl"+oldPid];
		delete(callbacks["rl"+oldPid]);
	}
});