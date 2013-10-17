var appManager = useModule('appManager');

var SocketInterface = useModule('socketInterface');

function Desktop(user) {
	this.user = user;
	this.currentLauncherApps = [];
	this.rawSocket = user.socket;
	this.socket = new SocketInterface(this.rawSocket, 'desktop');
	this.launcherSocket = new SocketInterface(this.rawSocket, 'launcher');
	this.user.bindDesktop(this);
	var self = this;
	this.rawSocket.on('disconnect', function(){
		if(self.user.socket === self.rawSocket) //make sure were still on the same socket here
			self.user.unbindDesktop();
	});
}

Desktop.prototype.setup = function(){
//	appManager.setupApplist();
//	launcherManager.setupLauncher(this.socket);
//	windowManager.recoverWindows();
	
	
 	var self = this; //for inside the timeout
 	
	setTimeout(function(){  //bruteforce stop/time to load
		self.socket.emit('showPage', 'desktop');		 
	}, 500);
	
	self.setupLauncher(); //bind the functions for socket messages
}


//launcher functions
Desktop.prototype.setupLauncher = function(){
	var self = this;
	//app list setup when ready
	
	var launcherApps = this.user.launcherApps;
	launcherApps.forEach(function(appID){
		//var app = appManager.appByID(appID);
		var app = {title:'test'};
		self.launcherSocket.emit('add', appID, app.title);
		self.launcherSocket.emit('isRunning', appID, false);
		self.currentLauncherApps.push(appID);
	});
	
	//launcher click event
	this.launcherSocket.on('click', function(appID){
		self.setLauncherRunning(appID, false)
	});
};
Desktop.prototype.setLauncherRunning = function(appID, isRunning){
	var self = this;
	var isPinned = (this.user.launcherApps.indexOf(appID) !== -1);
	var inLauncher = (this.currentLauncherApps.indexOf(appID) !== -1);
	if(isPinned){
		this.launcherSocket.emit('isRunning', appID, isRunning);
	} else if(inLauncher && isRunning == false){
		this.launcherSocket.emit('remove', appID);
		delete(this.currentLauncherApps[this.currentLauncherApps.indexOf(appID)]);
	} else if(!inLauncher && isRunning == true){
//		var app = appManager.appByID(appID);
		var app = {title:'test'}
		this.launcherSocket.emit('add', appID, app.title);
		this.currentLauncherApps.push(appID);
	}
};

module.exports = exports = Desktop;