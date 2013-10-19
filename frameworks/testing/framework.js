//framework vars, accessible to all framework modules
var useModule = function(moduleName){
	var module = { exports:{} };
	var exports = module.exports;
	eval(fs.readFileSync(frameworkDir + '/' + moduleName));
	return exports;
};
var socket = new useModule('socketInterface')(mtSocket, 'framework');
var processKey = makeID();

(function(){
	process.on('uncaughtException', function(err){
		mtSocket.emit('fatalError', err.stack);
	});

	var fs = require('fs');

	var app = {};
	app.id = __appConfig.id;
	app.name = __appConfig.name;
	
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


	__app = app;
	__appMain(__app);

});


function makeID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'a'+text; //start with char
}