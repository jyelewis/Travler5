var fs = require('fs');

bell = function(){
	fs.writeFileSync('/Users/jyelewis/Documents/lightToggle/bellState', '1');
};

//framework vars, accessible to all framework modules
var useModule;
(function(){
	var cache = {};
	useModule = function(moduleName){
		if(!cache[moduleName]){
			var module = { exports:{} };
			var exports = module.exports;
			eval(fs.readFileSync(frameworkDir + '/framework_modules/' + moduleName + '.js').toString());
			cache[moduleName] = module.exports;
		}
		return cache[moduleName];
	};
})();



var loadResource = function(resourceName, callback){
	fs.readFile(frameworkDir + '/' + resourceName, callback);
};

var socket = new (useModule('socketInterface'))(mtSocket, 'framework');
var cliSocket = new (useModule('socketInterface'))(mtSocket, 'cliEvent');
var processKey = makeID();
var app = useModule('appObj').init();

(function(){
	process.on('uncaughtException', function(err){
		for(var window in currentWindows){
			currentWindows[window].close();
		}
		socket.emit('fatalError', err.message, err.stack);
	});
	var currentWindows = useModule('windowManager').currentWindows;
	
	//bind socket events
	socket.on('click', function(){
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
	
	socket.on('triggerEvent', function(eventName, arg){
		app.emit(eventName, arg);
	});
	
	socket.on('die', function(){
		//close windows
		for(var window in currentWindows){
			currentWindows[window].close();
		}
		setTimeout(function(){
			socket.emit('dieReady');
		}, 300);
	});
	
	socket.on('recover', function(){
		useModule('windowManager').recoverWindows();
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