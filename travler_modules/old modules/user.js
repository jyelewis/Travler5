var crypto = require('crypto');

var userData = global.travlerConfig.user;

function User(socket){
	this.sessionID = socketID;
}

User.prototype.hashPass = function(check){
	var password1 = crypto.createHash('sha256');
	var password2 = crypto.createHash('sha256');
	password1.update(check);
	password2.update(password1.digest('hex'));
	return password2.digest('hex');
}

User.prototype.checkPassword = function(pass){
		return (this.hashPass(pass) === userData.password);
	}
	
User.prototype.loggedIn = function(){
	return (userData.sessionID === this.sessionID);
}

User.prototype.setPassword = function(pass){
	userData.password = this.hashPass(pass);
}

User.prototype.authenticate = function(auth){
	if(auth === false){
		if(this.loggedIn()){
			userData.sessionID = null;
		}
	} else {
		userData.sessionID = this.sessionID;
	}
	return true;
}

module.exports = exports = function(machineID){
	return new User(machineID);
};