var windowManager = useModule('windowManager');

exports.init = function(){
	var app = {};
	app.id = __appConfig.id;
	app.name = __appConfig.name;
	app.running = false;

	app.loadResource = function(file, callback){
		if(file.indexOf('..') != -1) return false;
		var filePath = __appDir + '/' + file;
		if(typeof callback === 'function'){
			fs.readFile(filePath, callback);
		} else {
			return fs.readFileSync(filePath);
		}
	};

	app.useModule = function(moduleName){
		if(moduleName.indexOf('..') != -1) return false;
		var filePath = __appDir + '/' + moduleName;
		return require(filePath);
	};

	app.shakeLauncher = function(){
		socket.emit('setLauncherShake', true);
		setTimeout(function(){
			socket.emit('setLauncherShake', false);
		}, 1000);
	};
	
	app.Window = windowManager.Window;

	//include an event emitter
	var appEventEmitter = new (require('events').EventEmitter);
	app.on = appEventEmitter.on;
	app.once = appEventEmitter.once;
	app.emit = appEventEmitter.emit;
	
	return app;
};