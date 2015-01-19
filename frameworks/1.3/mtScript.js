//mtApp file runs on the main thread to allow mt tasks to run from the app framework
var fs = require('fs');
var cp = require('child_process');
var appManager = require('../../travler_modules/appManager.js');
var userManager = require('../../travler_modules/userManager.js');
var SocketInterface = require('../../travler_modules/socketInterface.js'); //change to use module
var bindEvents = require('./mtFiles/bindEvents.js').bindEvents;
var networkRequest = require('./mtFiles/networkRequest.js');

function launch(app, callback){
	app.process = cp.fork(__dirname + '/framework.js');
	app.rawSocket = new SocketInterface(app.process, "", true); //create virtual socket through thread
	app.socket = new SocketInterface(app.rawSocket, 'framework');
	
	app.rawSocket.emit('appData', {
		 id: app.id
		,name: app.name
		,rootDir: app.rootDir
		,script: app.script
		,icon: app.icon
		,frameworkVersion: app.frameworkVersion
		,fileTypes: app.fileTypes
		,user: userManager.getUserData(app.user.username)
		,sysroot: __sysroot
	});
	
	app.socket.once('appReady', function(){
		//app has been launched and script executed
		callback();
	});
	
	networkRequest.bindEvents(app);
	bindEvents(app);
	
}






exports.launch = launch;