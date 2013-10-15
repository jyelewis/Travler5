var crypto = require('crypto');
//var configManager = useModule('configManager');
var appManager = useModule('appManager');

//var userData = global.travlerConfig.user;
//var users = configManager.getUsers();
var users = {};
var activeUsers = {};

useModule('startEvents').new('loadUsers', ['loadConfig', function(callback){
	var usersArray = travlerConfig.users;
	usersArray.forEach(function(obj){
		users[obj.username] = obj; //index by username
	});
	callback();
}]);

function User(username, password){
	if(!checkPassword(username, password)){
		return {}; //ensure they actually have authenticated
	}

	if(typeof activeUsers[username] !== 'undefined'){
		var oldUser = activeUsers[username];
		//kick the old connection off
		if(oldUser.connected){
			oldUser.socket.emit('kick');
		}
		return oldUser;
	} else {
		this.connected = true;
		this.username = username;
	
		this.desktop = null;
		this.runningApps = [];
		this.windows = [];
		activeUsers[this.username] = this;
	}
}

User.prototype.setSocket = function(socket){
	this.socket = socket;
	var self = this;
	this.socket.on('disconnect', function(){
		if(self.socket === socket){ //dont remove socket ref if it is not the same socket thats disconnected
			this.socket = null;
		}
	});
};

User.prototype.bindDesktop = function(desktop){
	this.desktop = desktop;
};
User.prototype.unbindDesktop = function(){
	this.desktop = null;
};


User.prototype.lock = function(){

};

User.prototype.logout = function(){
	delete(activeUsers[this.username]);
	this.runningApps.forEach(function(e){
//		appManager.()
	});
};

function hashPass(pass){
	var password1 = crypto.createHash('sha256');
	var password2 = crypto.createHash('sha256');
	password1.update(pass);
	password2.update(password1.digest('hex'));
	return password2.digest('hex');
}

function checkPassword(username, password){
	if(!userExists(username)) { return false; }
	return (hashPass(password) === users[username].password);
}

function userExists(username){
	return (typeof users[username] !== 'undefined');
}

function prep(username, callback){
	setTimeout(callback, 200);
}

exports.User = User;

exports.checkPassword = checkPassword;
exports.hashPass = hashPass;
exports.userExists = userExists;
exports.prep = prep;