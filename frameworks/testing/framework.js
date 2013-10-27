var fs = require('fs');

//framework vars, accessible to all framework modules
var useModule = function(moduleName){
	var module = { exports:{} };
	var exports = module.exports;
	eval(fs.readFileSync(frameworkDir + '/' + moduleName + '.js').toString());
	return module.exports;
};

var loadResource = function(resourceName, callback){
	fs.readFile(frameworkDir + '/' + resourceName, callback);
};

var socket = new (useModule('socketInterface'))(mtSocket, 'framework');
var cliSocket = new (useModule('socketInterface'))(mtSocket, 'cliEvent');
var processKey = makeID();

//useModule('windowRender');

(function(){
	process.on('uncaughtException', function(err){
		socket.emit('fatalError', err.stack);
	});
	
	var app = useModule('appObj').init();
	
	//bind socket events
	socket.on('click', function(){
		app.emit('launcherClick');
		if(!app.running){
			app.emit('launch');
		} else {
			//bring windows to focus
		}
	});
	
	socket.on('recover', function(){
		
	});
	
	__app = app;
	__appMain(__app);

})();


function makeID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'a'+text; //start with char
}