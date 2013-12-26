var crypto = require('crypto');
var appManager = require('./appManager');
var fs = require('fs');
var async = require('async');

var users = {};
var activeUsers = {};

require('./startEvents').new('loadUsers', ['loadConfig', function(callback){
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
			oldUser.socket = null;
			oldUser._transfer();
		} else {
			oldUser._unlock();
		}
		return oldUser;
	} else {
		//
		this.confDirPath = users[username].homedir + '/.travlerconf/';
		var userFileData = JSON.parse(fs.readFileSync(this.confDirPath + 'user.json'));
		
		this.connected = false;
		this.username = username;
		this.fullname = userFileData.fullname;
		this.backgroundPath = this.confDirPath + userFileData.background;
		this.backgroundImage = userFileData.background ? fs.readFileSync(this.backgroundPath) : null;
		this.launcherApps = userFileData.launcherApps;
		this.isAdmin = userFileData.isAdmin;
		//
		this.currentLauncherApps = [];
		
		this.desktop = null;
		this.apps = {};
		this.startedApps = false;
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



//login events
User.prototype._lock = function(){
	//APPEVENT:lock
	for(var appID in this.apps){
		var app = this.apps[appID];
		app.emit('triggerEvent', 'lock');
	}
};

User.prototype._unlock = function(){
	//APPEVENT:unlock
	for(var appID in this.apps){
		var app = this.apps[appID];
		app.emit('triggerEvent', 'unlock');
	}
};

User.prototype._transfer = function(){
	//APPEVENT:transfer
	for(var appID in this.apps){
		var app = this.apps[appID];
		app.emit('triggerEvent', 'transfer');
	}
};
//end login events

User.prototype.logout = function(){
	for(var appID in this.apps){
		this.apps[appID].kill();
	}
	delete(activeUsers[this.username]);
};

User.prototype.login = function(callback){
	var self = this;
	if(!this.startedApps){
		this.launchApps(function(){
			//pin apps
			//add locked apps to launcher
			self.launcherApps.forEach(function(appID){
				if(self.apps[appID]){
					self.currentLauncherApps.push({
						isRunning:false,
						appID:appID
					});
				} else {
					console.log('Error: "'+appID+'" is not installed and cannot be pinned to the launcher');
				}
			});
			//end launcher code
			callback();
		});
	} else {
		for(var appID in this.apps){
			var app = this.apps[appID];
			app.emit('recover');
		}
		callback();
	}
};

User.prototype.launchApps = function(callback){
	var self = this;
	this.startedApps = true;
	var asyncLaunchers = [];
	appManager.installedApps(function(apps){
		apps.forEach(function(appDir){
			asyncLaunchers.push(function(cb){
				appManager.launchApp(appDir, self, function(err, app){
					if(err){ console.log(err + " (" + appDir + ")"); } else {
						self.apps[app.id] = app;
					}
					cb();
				});
			});
		});
		async.parallel(asyncLaunchers, callback);
	});
};


//functions
function changePassword(username, password){
	var configUsers = travlerConfig.users;
	for(var i=0; i<configUsers.length; i++){
		if(configUsers[i].username == username){
			configUsers[i].password = hashPass(password);
		}
	}
	saveConfigFile(); //global function
}

function getUserData(username){
	var confDirPath = users[username].homedir + '/.travlerconf/';
	var userFileData = JSON.parse(fs.readFileSync(confDirPath + 'user.json'));

	var obj = {};
	obj.username = username;
	obj.fullname = userFileData.fullname;
	obj.background = userFileData.background;
	obj.homeDir = users[username].homedir;
	obj.launcherApps = userFileData.launcherApps;
	obj.isAdmin = userFileData.isAdmin;
	return obj;
}

function saveUserData(username, changes){
	//username and homeDir changes
	if(changes.username || changes.homeDir){
		var configUsers = travlerConfig.users;
		for(var i=0; i<configUsers.length; i++){
			if(configUsers[i].username == username){
				if(changes.username){
					configUsers[i].username = changes.username;
				}
				if(changes.homeDir){
					configUsers[i].homedir = changes.homeDir;
				}
			}
		}
		saveConfigFile(); //global function
	}
	
	var confDirPath = users[username].homedir + '/.travlerconf/';
	var userFileData = JSON.parse(fs.readFileSync(confDirPath + 'user.json'));
	['fullname', 'background', 'launcherApps', 'isAdmin'].forEach(function(param){
		if(typeof(changes[param]) != 'undefined'){
			userFileData[param] = changes[param];
		}
	});
	fs.writeFile(confDirPath + 'user.json', JSON.stringify(userFileData));
}

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
						background: '',
						launcherApps: [],
						isAdmin: false
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

exports.users = users;
exports.checkPassword = checkPassword;
exports.hashPass = hashPass;
exports.userExists = userExists;
exports.prep = prep;
exports.getUserData = getUserData;
exports.saveUserData = saveUserData;
exports.changePassword = changePassword;