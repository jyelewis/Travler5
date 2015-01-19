var windowManager = useModule('windowManager');

//app modules, this function is included where app function is defined
var useAppFrameworkModule;
(function(){
	var cache = {};
	useAppFrameworkModule = function(moduleName){
		if(!cache[moduleName]){
			try {
				var module = { exports:{} };
				var exports = module.exports;
				eval(fs.readFileSync(frameworkDir + '/app_modules/' + moduleName + '.js').toString());
				cache[moduleName] = module.exports;
			} catch(e){} //just return undefined if it cant load
		}
		return cache[moduleName];
	};
})();

exports.init = function(){
	var app = {};
	app.id = __appConfig.id;
	app.name = __appConfig.name;
	app.running = false;
	app.root = __appDir;

	app.prompt = useModule('prompt').prompt;
	app.data = useModule('appData');

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
		var module;
		try {
			module = require(filePath);
		} catch(e){
			//couldnt load module, search app_modules
			module = useAppFrameworkModule(moduleName);
			if(!module){
				throw e;
			}
		}
		return module;
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