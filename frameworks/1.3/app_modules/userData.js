exports.getUserData = function(username, callback){
	app.fwSocket.req('userData', username, callback);
};

exports.setPassword = function(username, newPassword){
	app.fwSocket.emit('setPassword', username, newPassword);
};

exports.saveUserData = function(username, changes){
	app.fwSocket.emit('saveUserData', username, changes);
};

exports.getUserList = function(cb){
	app.fwSocket.req('userList', cb);
};