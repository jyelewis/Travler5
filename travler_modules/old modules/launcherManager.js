var appManager = useModule('appManager');
var windowManager = useModule('windowManager');
var startEvents = useModule('startEvents');
var getSocket = useModule('getSocket').getSocket;
var pinned = [];
var currApps = {};

startEvents.new('launcherManager', ['loadConfig', 'appManager',function(callback){
	travlerConfig.user.launcherApps.forEach(function(app){
		var appID = appManager.appByName(app).id;
		pinned.push(appID); //get the app id from its name
		new LauncherApp(appID, false);
	});
	process.nextTick(callback);
}]);

exports.click = function(appID){
	appByID(appID).click();
};

function appByID(appID){
	var app = currApps[appID]
	if(typeof app == 'undefined'){
		return false;
	}
	return app;
}

function isPinned(appID){
	if(pinned.indexOf(appID) !== -1){
		return true;
	}
	return false;
}

function setupLauncher(){
	var socket = getSocket();
	socket.emit('desktop.launcher.clear'); //empty the launcher before adding apps
	for(launcherApp in currApps){
		currApps[launcherApp].setup();
	}
}

function startRunning(app){
	var launcherIcon = appByID(app.id);
	if(launcherIcon){
		launcherIcon.running(true, getSocket());
		return;
	}
	new LauncherApp(app.id, true).setup(); //call it and then run setup to send it
};

var LauncherApp = function(appID, running){
	this.appID = appID;
	this.pinned = isPinned(appID);
	this.isRunning = running;
	this.bind();
	currApps[appID] = this;
};

LauncherApp.prototype.bind = function(){
	this.app = appManager.appByID(this.appID); //for when obj changes
	var self = this;
	var closeFunc = function(){ //once so once the window is close nothing is triggered again
		var socket = getSocket();
		self.running(false, socket);
	};
	if(this.pinned){
		this.app.on('windowClose', closeFunc);
	} else { //we only want to bind once if the app is pinned, the object is recreated and therefore re bound
		this.app.once('windowClose', closeFunc)
	}
};

LauncherApp.prototype.setup = function(){
	var socket = getSocket();
	socket.emit('desktop.launcher.alter', this.appID, 'create', this.app.name);
	socket.emit('desktop.launcher.alter', this.appID, 'running', this.isRunning);
};

LauncherApp.prototype.running = function(boolRunning){
	var socket = getSocket();
	if(boolRunning){
		if(this.pinned){ // it should already be there so just set it to running
			socket.emit('desktop.launcher.alter', this.appID, 'running', true);
		} else {
			socket.emit('desktop.launcher.alter', this.appID, 'create', this.app.name);
		}
		this.isRunning = true;
	} else {
		if(this.pinned){
			socket.emit('desktop.launcher.alter', this.appID, 'running', false);
		} else { //its not pinned and we are closing the app, delete the icon
			socket.emit('desktop.launcher.alter', this.appID, 'remove');
			delete(currApps[this.appID]); //remove this object from the list
		}
		this.isRunning = false;
	}
};

LauncherApp.prototype.click = function(){
	this.app.emit('launcherClick');
	if(!this.isRunning){
		appManager.launchApp(this.app.id);
	}
};

exports.appByID = appByID;
exports.setupLauncher = setupLauncher;
exports.startRunning = startRunning;