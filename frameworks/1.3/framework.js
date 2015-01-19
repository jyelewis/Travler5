var fs = require('fs');
var SocketInterface = require('./framework_modules/socketInterface.js');
var appObj = require('./framework_modules/appObj.js');

var loadResource = function(resourceName, callback){
	fs.readFile(frameworkDir + '/' + resourceName, callback);
};

var mtSocket = new SocketInterface(process, '', true);

app = {}; //global app variable

mtSocket.on('appData', function(appData){
	appObj.init(app, appData, mtSocket);
	
	var windowManager = require('./framework_modules/windowManager.js');
	var currentWindows = windowManager.currentWindows;

	process.on('uncaughtException', function(err){
		for(var window in currentWindows){
			currentWindows[window].close();
		}
		app.fwSocket.emit('fatalError', err.message, err.stack);
	});


	//bind socket events
	app.fwSocket.on('click', function(){
		app.emit('launcherClick');
		if(!app.running){
			app.emit('launch');
		} else {
			//bring windows to focus
			for(var window in currentWindows){
				currentWindows[window].focus();
			}
		}
	});

	app.fwSocket.on('triggerEvent', function(eventName, arg){
		app.emit(eventName, arg);
	});

	app.fwSocket.on('die', function(){
		//close windows
		for(var window in currentWindows){
			currentWindows[window].close();
		}
		setTimeout(function(){
			app.fwSocket.emit('dieReady');
		}, 300);
	});

	app.fwSocket.on('recover', function(){
		windowManager.recoverWindows();
	});

	
	//start app
	require(app.rootDir + '/' + app.script);
	
	app.fwSocket.emit('appReady');
});






