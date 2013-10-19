var cp = require('child_process');
var SocketInterface = require('./socketInterface.js'); //change to use module

var __sysroot = __dirname + '/..'; //only for testing the file. Remove this

//var appDefaultImage = loadResource('/images/appDefault.svg');
var appDefaultImage = false;

function App(objThis){
	this.id = objThis.id;
	this.name = objThis.name;
	this.rootDir = objThis.rootDir;
	this.icon = objThis.icon;
	this.process = objThis.process;
	this.socket = objThis.socket;
	this.user = objThis.user;
}

function launchApp(rootDir, user, callback){
	var appObj = {};
	appObj.rootDir = rootDir;
	appObj.user = user;
	appObj.process = cp.fork(__sysroot + '/travler_modules/threadBase.js');
	appObj.socket = new SocketInterface(appObj.process, "", true); //create virtual socket through thread
	appObj.socket.emit('setTitle', 'Travler (loading process)');
	
	//load in the actual app file
	appObj.socket.emit('loadFile', rootDir);
	
	appObj.socket.on('configLoad', function(config){
		appObj.socket.emit('setTitle', 'Travler (' + config.id + ')');
		appObj.id = config.id;
		appObj.name = config.name;
		appObj.icon = config.icon? config.icon : appDefaultImage;
		callback(new App(appObj));
	});
	
}


launchApp(__sysroot + '/applications/test', '', function(app){
	console.log(app.name);
});