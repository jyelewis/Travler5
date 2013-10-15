var spawn = require('child_process').spawn;

var appConfig = {
	name: 'Cloud9 IDE',
	icon: loadResource('/icon.svg')
};


exports.init = function(callback){
	callback(appConfig, run);
};

function run(app){
	var serverRunning = false;
	var serverPort = false;
	app.bindRequest('/c9', function(req, res){
		//res.end('test message');
		if(serverRunning && (serverPort !== -1)){ //server is running and has a port
			res.redirect('http://' + req.host + ':' + serverPort + '/'); //send to the dev server
			res.end();
		} else {
			res.write('<script>setTimeout(function(){location.reload();}, 500);</script>');
			res.end('Cloud9 Process not running.');
		}
	});
	app.on('launch', function(){
		var window = app.createWindow();
		window.UI.title(false);
		serverPort = app.requestPort();
		//start server......
		var devServer = spawn('node', [resourcePath('/cloud9Server/server.js'), '-p', serverPort, '-w', __sysroot + '/devProjects']);
		setTimeout(function(){
			serverRunning = true;
		}, 1200);
		devServer.on('close', function (code) {
			app.releasePort(serverPort);
			serverRunning = false;
		});
	
	
		//end server code.................

		window.UI.html = loadResource('/windows/main/main.html');
		window.UI.css  = loadResource('/windows/main/main.css');
		window.UI.js   = loadResource('/windows/main/main.js');
		window.UI.render();
		window.UI.close = function(){
			devServer.kill();
			window.close();
		};
	});
}