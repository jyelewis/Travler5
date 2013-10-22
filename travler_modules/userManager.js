var crypto = require('crypto');
var appManager = useModule('appManager');
var fs = require('fs');
var async = require('async');

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
	var self = this;
	var oldUser = activeUsers[username];
	//kick the old connection off
		if(oldUser.connected){
			oldUser.socket.emit('kick');
		}
		return oldUser;
	} else {
		this.confDirPath = users[username].homedir + '/.travlerconf/';
		var userFileData = JSON.parse(fs.readFileSync(this.confDirPath + 'user.json'));

		this.connected = false;
		this.username = username;
		this.fullname = userFileData.fullname;
		this.backgroundPath = this.confDirPath + userFileData.background;
		this.launcherApps = userFileData.launcherApps;
		
		this.desktop = null;
		this.apps = {};
		activeUsers[this.username] = this;
		
		return this;
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
	this.connected = true;
};
User.prototype.unbindDesktop = function(){
	this.desktop = null;
	this.connected = false;
};


User.prototype.lock = function(){

};

User.prototype.logout = function(){
	delete(activeUsers[this.username]);
	this.runningApps.forEach(function(e){
//		appManager.()
	});
};

User.prototype.login = function(callback){
	this.launchApps(callback);
};

User.prototype.launchApps = function(callback){
	var self = this;
	var asyncLaunchers = [];
	appManager.installedApps(function(apps){
		apps.forEach(function(appDir){
			asyncLaunchers.push(function(cb){
				appManager.launchApp(appDir, self, function(err, app){
					if(err) throw err;
					self.apps[app.id] = app;
					cb();
				});
			});
		});
		async.parallel(asyncLaunchers, callback);
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
	//check all the files for the travlerconf dir and create them if they arent there
	fs.exists(users[username].homedir + '/.travlerconf/', function(exists){
		if(!exists){
			fs.mkdir(users[username].homedir + '/.travlerconf/', checkFiles);
		} else {
			checkFiles();
		}
	});
	var checkFiles = function(){
		async.parallel([
			function(cb){ //user.json file
				fs.exists(users[username].homedir + '/.travlerconf/user.json', function(exists){
					if(exists){ cb(); return; }
					var obj = {
						fullname: '',
						background: false,
						launcherApps: []
					};
					fs.writeFile(users[username].homedir + '/.travlerconf/user.json', JSON.stringify(obj), cb);
				});
			},
			function(cb){ //desktop.json file
				fs.exists(users[username].homedir + '/.travlerconf/desktop.json', function(exists){
					if(exists){ cb(); return; }
					var obj = {};
					fs.writeFile(users[username].homedir + '/.travlerconf/desktop.json', JSON.stringify(obj), cb);
				});
			},
			function(cb){ //appData dir
				fs.exists(users[username].homedir + '/.travlerconf/appData/', function(exists){
					if(exists){ cb(); return; }
					fs.mkdir(users[username].homedir + '/.travlerconf/appData/', cb);
				});
			}
		], callback); //call the prep callback function
	};
}

exports.User = User;

exports.checkPassword = checkPassword;
exports.hashPass = hashPass;
exports.userExists = userExists;
exports.prep = prep;