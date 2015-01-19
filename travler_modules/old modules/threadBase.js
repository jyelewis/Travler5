var SocketInterface = require(__dirname + '/socketInterface.js');

var mtSocket = new SocketInterface(process, '', true);

mtSocket.on('setTitle', function(title){
	process.title = title;
});

var appConfig = function appConfig(appObj){
	__appConfig = appObj;
	__checkMain(function(err){
		mtSocket.emit('configLoad', err, appObj);
	});
};

var __appMain;
var __appDir;
var __appConfig;
var __checkMain;

var nextTick = process.nextTick;
mtSocket.once('loadFile', function(appDir, __username){
	(function(){
		var process = { nextTick:nextTick }; //block access to these vars
		var mtSocket;
		var SocketInterface;
		__appDir = appDir;
		delete(appDir);
		var __appConfig;
	
		require('fs').readFile(__appDir + '/app.js', function(err, code){
			__checkMain = function(callback){
				if(typeof(main) === 'function'){
					__appMain = main;
					callback(null);
				} else  {
					callback('Application has no main function');
				}
				delete(__checkMain);
			};
			eval(code.toString());
		});
	})();
	if(!__appMain){
	//	process.kill();
	}
});

mtSocket.on('loadFramework', function(frameworkDir, __username){
	/* vars accessible
	 - process
	 - mtSocket
	 - __appMain
	 - __appDir
	 - frameworkDir
	 - __appConfig
	*/
	require('fs').readFile(frameworkDir + '/framework.js', function(err, code){
		eval(code.toString());
	});
});