var callbacks = {};

exports.getUserData = function(username, callback){
	socket.emit('getUserData', username);
	callbacks[username] = callback;
};

socket.on('getUserData', function(data){
	var cb = callbacks[data.username];
	if(cb){
		process.nextTick(function(){
			cb(data);
		});
		delete(callbacks[data.username]);
	}
});

exports.setPassword = function(username, newPassword){
	socket.emit('setPassword', username, newPassword);
};

exports.saveUserData = function(username, changes){
	socket.emit('saveUserData', username, changes);
};

var userListCbs = [];
exports.getUserList = function(cb){
	userListCbs.push(cb);
	socket.emit('getUserList');
};

socket.on('getUserList', function(userList){
	for(var i=0; i<userListCbs.length; i++){
		if(userListCbs[i]){
			userListCbs[i](userList);
			delete(userListCbs[i]);
		}
	}
});