var appManager = useModule('appManager');

var SocketInterface = useModule('socketInterface');

function Desktop(user) {
	this.user = user;
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
	self.socket.on('appEvent', function(evntObj){
		self.user.apps[evntObj.appID].rawSocket.emit('INTERFACE.cliEvent', evntObj);
	});
	self.socket.on('logout', function(){
		self.user.logout();
		self.socket.emit('reload');
	});
}


//launcher functions
Desktop.prototype.setupLauncher = function(){
	var self = this;
	//app list setup when ready
	
	//var launcherApps = this.user.launcherApps;
	
	this.user.currentLauncherApps.forEach(function(launcherObj){
		var app = self.user.apps[launcherObj.appID];
		self.launcherSocket.emit('add', app.id, app.process.pid, app.name);
		self.launcherSocket.emit('isRunning', app.id, launcherObj.isRunning);
	});
	
	//launcher click event
	this.launcherSocket.on('click', function(appID){
		 self.user.apps[appID].emit('click');
	});
};
Desktop.prototype.setLauncherRunning = function(appID, isRunning){
	var self = this;
	var findCurrentLauncherObj = function(appID){
		var currentApps = self.user.currentLauncherApps;
		for(var i=0; i<=currentApps.length; i++){
			if(currentApps[i].appID == appID){
				return currentApps[i];
			}
		}
		return null;
	}
	
	var isPinned = (this.user.launcherApps.indexOf(appID) !== -1);
	var inLauncher = (findCurrentLauncherObj(appID) !== null);
	if(isPinned){
		this.launcherSocket.emit('isRunning', appID, isRunning);
		findCurrentLauncherObj(appID).isRunning = isRunning;
	} else if(inLauncher && isRunning == false){
		this.launcherSocket.emit('remove', appID);
		findCurrentLauncherObj(appID).appID = null;
	} else if(!inLauncher && isRunning == true){
		var app = this.user.apps[appID];
		this.launcherSocket.emit('add', appID, app.name);
		this.user.currentLauncherApps.push({
			appID: appID,
			isRunning: true
		});
	}
};
Desktop.prototype.setLauncherShake = function(appID, shake){
	var inLauncher = (this.currentLauncherApps.indexOf(appID) !== -1);
	if(!inLauncher) return false;
	this.launcherSocket.emit('shake', appID, shake);
};

module.exports = exports = Desktop;










