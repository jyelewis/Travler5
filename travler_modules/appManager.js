var fs = require('fs');
var cp = require('child_process');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SocketInterface = require('./socketInterface.js'); //change to use module


var appDefaultImage = fs.readFileSync(__dirname + '/../resources_server/images/appDefault.png');

var processes = {};

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
	this.frameworkScript = objThis.frameworkScript;
	
	this.windowPaths = {};
	
	processes[this.process.pid] = this;
	
	this.bindEvents();
}
util.inherits(App, EventEmitter);
App.prototype.bindEvents = function(){
	this.frameworkScript.bindEvents(this);

	var self = this;
	//events for self
	this.on('click', function(){
		self.socket.emit('click');
	});
	
	this.on('recover', function(){
		self.socket.emit('recover');
	});
	
	this.on('die', function(){
		throw new Error('do not emit to this event, use app.die');	
	});
	this.socket.on('dieReady', function(){
		self.forceKill();
	});
	
	this.on('triggerEvent', function(eventName){
		self.socket.emit('triggerEvent', eventName);
	});
	
	this.rawSocket.on('INTERFACE.cliEvent', function(evntObj){
		self.user.desktop.socket.emit('appEvent_'+self.id, evntObj);
	});
};

//app prototype functions

App.prototype.kill = function(){
	//this.emit('die'); //let everyone else know
	this.socket.emit('die');
	//dieReady handled above
};

App.prototype.forceKill = function(){
	this.process.kill();
	delete(this.user.apps[this.id]);
	delete(processes[this.process.pid]);
	if(this.user.desktop)
		this.user.desktop.reloadAppList();
};

//end app prototype



//end App object
function launchApp(rootDir, user, callback){
	var appObj = {};
	var loadError = false;
	//error checking
	//end error checking
	appObj.rootDir = rootDir;
	appObj.user = user;
	appObj.process = cp.fork(__sysroot + '/travler_modules/threadBase.js');
	appObj.socket = new SocketInterface(appObj.process, "", true); //create virtual socket through thread
	appObj.socket.emit('setTitle', 'Travler (loading process)');
	
	//load in the actual app file
	fs.exists(appObj.rootDir + "/app.js", function(exists){
		if(exists)
			appObj.socket.emit('loadFile', appObj.rootDir, appObj.user.username);
		else {
			appObj.process.kill();
			callback(new Error('App doesnt exist'), null);
			clearTimeout(loadTimeout);
			return false;
		}
	});
	
	appObj.socket.on('configLoad', function(err, config){
		if(err){
			clearTimeout(loadTimeout);
			callback(new Error(err), null);
			return;
		}
		
		if(user.apps[config.id]){
			clearTimeout(loadTimeout);
			callback(new Error('Application with same id already running'), null);
			return;
		}
		appObj.socket.emit('setTitle', 'Travler (' + config.id + ')');
		appObj.id = config.id;
		appObj.name = config.name;
		appObj.icon = config.icon ? fs.readFileSync(appObj.rootDir + "/" + config.icon) : appDefaultImage;
		appObj.framework = config.framework;
		fs.exists(__sysroot + '/frameworks/', function(exists){
			if(exists) {
				appObj.socket.emit('loadFramework', __sysroot + '/frameworks/' + config.framework);
				appObj.frameworkScript = require( __sysroot + '/frameworks/' + config.framework + '/mtScript.js');
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
		var apps = [];
		files.forEach(function(file){
			if(file.substring(0,1) != '.')
				apps.push(__sysroot + '/applications/' + file);
		});
		callback(apps, null);
	});
};


exports.App = App;
exports.launchApp = launchApp;
exports.installedApps = installedApps;
exports.processes = processes;