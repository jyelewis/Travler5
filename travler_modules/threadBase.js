var SocketInterface = require(__dirname + '/socketInterface.js');

var mtSocket = new SocketInterface(process, '', true);

mtSocket.on('setTitle', function(title){
	process.title = title;
});

var appConfig = function appConfig(appObj){
	mtSocket.emit('configLoad', appObj);
};

var __appMain;
mtSocket.once('loadFile', function(scriptDir){
	var process; //block access to these vars
	var mtSocket;
	var SocketInterface;
	
	require('fs').readFile(scriptDir + '/app.js', function(err, code){
		eval(code.toString());
		__appMain = main;
	});
});