var fs = require('fs');
var cp = require('child_process');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SocketInterface = require('./socketInterface.js'); //change to use module

//var __sysroot = __dirname + '/..'; //only for testing the file. Remove this

var appDefaultImage = loadResource('/images/appDefault.svg');
//var appDefaultImage = false;

function App(objThis){
	this.id = objThis.id;
	this.name = objThis.name;
	this.rootDir = objThis.rootDir;
	this.icon = objThis.icon;
	this.framework = objThis.framework;
	this.process = objThis.process;
	this.rawSocket = objThis.socket;
	this.socket = new SocketInterface(this.rawSocket, 'framework');
	this.user = objThis.user;
	
	this.bindEvents();
}
util.inherits(App, EventEmitter);
App.prototype.bindEvents = function(){
	var self = this;
	this.socket.on('fatalError', function(err){
		console.log('Application error: ' + ' ('+self.id+')\n\t' + err);
		self.process.kill();
		self.emit('exit');
	});
	this.socket.on('setLauncherShake', function(shake){
		if(this.user.connected){
			this.user.desktop.setLauncherShake(self.id, shake);
		}
	});
};



//end App object
function launchApp(rootDir, user, callback){
	var appObj = {};
	var loadError = false;
	appObj.rootDir = rootDir;
	appObj.user = user;
	appObj.process = cp.fork(__sysroot + '/travler_modules/threadBase.js');
	appObj.socket = new SocketInterface(appObj.process, "", true); //create virtual socket through thread
	appObj.socket.emit('setTitle', 'Travler (loading process)');
	
	//load in the actual app file
	fs.exists(appObj.rootDir, function(exists){
		if(exists)
			appObj.socket.emit('loadFile', appObj.rootDir);
		else {
			appObj.process.kill();
			callback(new Error('App doesnt exist'), null);
			clearTimeout(loadTimeout);
			return false;
		}
	});
	
	appObj.socket.on('configLoad', function(config){
		appObj.socket.emit('setTitle', 'Travler (' + config.id + ')');
		appObj.id = config.id;
		appObj.name = config.name;
		appObj.icon = config.icon? config.icon : appDefaultImage;
		appObj.framework = config.framework;
		fs.exists(__sysroot + '/frameworks/', function(exists){
			if(exists) {
				appObj.socket.emit('loadFramework', __sysroot + '/frameworks/' + config.framework);
				callback(null, new App(appObj));
			} else {
				appObj.process.kill();
				callback(new Error('Framework not installed'), null);
				return false;
			}
			clearTimeout(loadTimeout);
		});
	});
	
	var loadTimeout = setTimeout(function(){
		appObj.process.kill();
		callback(new Error('Application load timed out'), null);
	}, 5000)
	
	return true;
}

//get list of apps in apps directory
function installedApps(callback){
	fs.readdir(__sysroot + '/applications/', function(err, files){
		if(err){ callback(err, null); return; }
		console.log(files);
		callback(files, null);
	});
};


exports.App = App;
exports.launchApp = launchApp;
exports.installedApps = installedApps;

/*launchApp(__sysroot + '/applications/test', '', function(err, app){
	if(err) throw err;
});*/