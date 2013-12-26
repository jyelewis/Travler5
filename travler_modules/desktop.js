var appManager = useModule('appManager');

var SocketInterface = useModule('socketInterface');

function Desktop(user) {
	this.user = user;
	this.rawSocket = user.socket;
	this.socket = new SocketInterface(this.rawSocket, 'desktop');
	this.launcherSocket = new SocketInterface(this.rawSocket, 'launcher');
	this.user.bindDesktop(this);
	this.size = {width:0, height:0};
	var self = this;
	this.rawSocket.on('disconnect', function(){
		if(self.user.socket === self.rawSocket){ //make sure were still on the same socket here
			self.user.unbindDesktop();
			self.user._lock(); //trigger lock
		}
	});
}

Desktop.prototype.setup = function(){
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
	self.socket.on('screenSize', function(newSize){
		self.size = newSize;
	});

	//background image
	if(this.user.backgroundImage){
		var bgImageURI = "data:image/png;base64," + this.user.backgroundImage.toString("base64");
		self.socket.emit('setBackgroundImage', bgImageURI);
	}
	
	setTimeout(function(){
		self.socket.emit('screenSize'); //request the screen size
	}, 1000); //dom needs to be loaded
}


//launcher functions
Desktop.prototype.setupLauncher = function(){
	var self = this;
	//app list setup when ready
	
	this.user.currentLauncherApps.forEach(function(launcherObj){
		if(launcherObj.appID !== null){
			var app = self.user.apps[launcherObj.appID];
			self.launcherSocket.emit('add', app.id, app.process.pid, app.name);
			self.launcherSocket.emit('isRunning', app.id, launcherObj.isRunning);
		}
	});
	this.reloadAppList();
	
	//launcher click event
	this.launcherSocket.on('click', function(appID){
		 self.user.apps[appID].emit('click');
	});
};

Desktop.prototype.reloadAppList = function(){
	var self = this;
	
	var appListSorted = [];
	for(var appID in this.user.apps){
		var app = this.user.apps[appID];
		appListSorted.push(app);
	}
	appListSorted.sort(function(a,b){
		return (a.name.toLowerCase() > b.name.toLowerCase());
	});
	
	self.launcherSocket.emit('clearAppList');
	appListSorted.forEach(function(app){
		self.launcherSocket.emit('list.add', app.id, app.process.pid, app.name);
	});
};

Desktop.prototype.setLauncherRunning = function(appID, isRunning){
	var self = this;
	var findCurrentLauncherObj = function(appID){
		var currentApps = self.user.currentLauncherApps;
		for(var i=0; i<=currentApps.length-1; i++){
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
		this.launcherSocket.emit('add', appID, app.process.pid, app.name);
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










