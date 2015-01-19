var SocketInterface = require('./socketInterface.js');

//app modules, this function is included where app function is defined
var useAppFrameworkModule;
(function(){
	var cache = {};
	useAppFrameworkModule = function(moduleName){
		try {
			return require('./../app_modules/'+moduleName);
		} catch(e) {
			throw e;
		} //return undefined if not found
	};
})();

exports.init = function(app, appData, mtSocket){
	app.id = appData.id;
	app.name = appData.name;
	app.rootDir = appData.rootDir;
	app.script = appData.script;
	app.icon = appData.icon;
	app.frameworkVersion = appData.frameworkVersion;
	app.fileTypes = appData.fileTypes;
	app.user = appData.user;
	app.sysroot = appData.sysroot;
	
	app.fwSocket = new SocketInterface(mtSocket, 'framework');
	app.cliSocket = new SocketInterface(mtSocket, 'cliEvent');
	
	app.running = false;
	app.prompt = require('./prompt.js').prompt;
	app.data = require('./appData.js');
	
	

	app.useModule = useAppFrameworkModule;

	app.shakeLauncher = function(){
		app.fwSocket.emit('setLauncherShake', true);
		setTimeout(function(){
			app.fwSocket.emit('setLauncherShake', false);
		}, 1000);
	};
	
	var windowManager = require('./windowManager.js');
	app.Window = windowManager.Window;

	//include an event emitter
	var appEventEmitter = new (require('events').EventEmitter);
	app.on = appEventEmitter.on;
	app.once = appEventEmitter.once;
	app.emit = appEventEmitter.emit;
	
	return app;
};











