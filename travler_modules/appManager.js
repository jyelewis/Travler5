var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var SocketInterface = require('./socketInterface.js'); //change to use module

var processes = {};

function App(){
/*	this.id = objThis.id;
	this.name = objThis.name;
	this.rootDir = objThis.rootDir;
	this.icon = objThis.icon;
	this.framework = objThis.framework;
	this.process = objThis.process;
	this.rawSocket = objThis.socket;
	this.socket = new SocketInterface(this.rawSocket, 'framework');
	this.user = objThis.user;
	this.frameworkScript = objThis.frameworkScript;*/
	
	this.windowPaths = {};
}
util.inherits(App, EventEmitter);



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



var launchApp = function(appRoot, user, callback){
	var app = new App();
	
	app.rootDir = appRoot;
	app.user = user;
	
	fs.readFile(app.rootDir + '/app.json', function(err, config){
		if (err){
			callback(new user.error("Unable to to read app.json"), null);
			return;
		}
		config = JSON.parse(config);
		
		try {
			requiredProps = ['id', 'name', 'frameworkVersion'];
			requiredProps.forEach(function(prop){
				if(typeof config[prop] === 'undefined'){
					throw new user.error("Required property "+prop+" is not in app.json");
				}
				app[prop] = config[prop];
			});
		} catch(e){
			callback(e, null);
			return;
		}
		
		try {
			app.framework = require(__sysroot + '/frameworks/' + config.frameworkVersion + '/mtScript.js');
		} catch(e){
			callback(new user.error("Unable to load framework"), null);
		}
		
		app.icon = config.icon? config.icon:false;
		app.fileTypes = config.fileTypes? config.fileTypes:[];
		app.script = config.script? config.script:'app.js';
		
		try {
			app.framework.launch(app, function(){
				processes[app.process.pid] = app;
				callback(null, app);
			});
		} catch(e){
			callback(new user.error("Unable to launch app "+e.stack), null);
		}
		
	});
};


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