//var appManager = useModule('appManager');
//var windowManager = useModule('windowManager');
//var launcherManager = useModule('launcherManager');
var SocketInterface = useModule('socketInterface');

function Desktop(user) {
	this.user = user;
	this.rawSocket = user.socket;
	this.socket = new SocketInterface(this.rawSocket, 'desktop');
	this.user.bindDesktop(this);
	var self = this;
	this.rawSocket.on('disconnect', function(){
		self.user.unbindDesktop();
	});
}

Desktop.prototype.setup = function(){
//	appManager.setupApplist();
//	launcherManager.setupLauncher(this.socket);
//	windowManager.recoverWindows();
	
	
 	var self = this; //for inside the timeout
	setTimeout(function(){  //its a bit of a hack but just making sure that all is loaded
							//at some stage work out a way to know exactly when ready
		self.socket.emit('showPage', 'desktop');
		self.setupSockets(); //bind the functions for socket messages
	}, 2000);
}

Desktop.prototype.setupSockets = function(){ //bind the functions for socket messages
	var self = this;
	/*this.socket.on('desktop.launcher.click', function(appID){
	//	launcherManager.click(appID, self.socket);
	});
	this.socket.on('desktop.appList.click', function(appID){
	//	appManager.launchApp(appID);
	});
	
	//this is where applications socket abstraction socket is routered to the appropriate place
	/*this.socket.on('interfaceEmit', function(emit){
		var window = windowManager.windowByID(emit.id);
		if(!window){ return false; }
		var args = [];
		for(prop in emit['arguments']){
			args.push(emit['arguments'][prop]);
		}
		if(emit.type == 'custom'){
			window._customEmitter.emit.apply(window._customEmitter, args);
		} else {
			window._windowEmitter.emit.apply(window._windowEmitter, args);
		}
	});*/
};

module.exports = exports = Desktop;