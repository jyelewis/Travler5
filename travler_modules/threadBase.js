var SocketInterface = require(__dirname + '/socketInterface.js');

var mtSocket = new SocketInterface(process, '', true);

mtSocket.on('setTitle', function(title){
	process.title = title;
});

var appConfig = function appConfig(appObj){
	__appConfig = appObj;
	mtSocket.emit('configLoad', appObj);
};

var __appMain;
var __appDir;
var __appConfig
mtSocket.once('loadFile', function(appDir){
	var process; //block access to these vars
	var mtSocket;
	var SocketInterface;
	__appDir = appDir;
	delete(appDir);
	var __appConfig;
	
	require('fs').readFile(__appDir + '/app.js', function(err, code){
		eval(code.toString());
		__appMain = main;
	});
});

mtSocket.on('loadFramework', function(frameworkDir){
	/* vars accessible
	 - process
	 - mtSocket
	 - __appMain
	 - __appDir
	 - frameworkDir
	*/
	require('fs').readFile(frameworkDir + '/framework.js', function(err, code){
		eval(code.toString());
	});
});