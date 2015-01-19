var fs = require('fs');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var SocketInterface = useModule('socketInterface');

var currentWindows = {};
var numWindows = 0;

//window constructor function
function Window(){
	var self = this;
	this.appID = __app.id;
	this.id = makeID();
	this.processKey = processKey;
	this.code = false;
	this.filePath = false;
	this.GUIEvents = new EventEmitter();
	this._directSocket = new SocketInterface(cliSocket, 'window_'+this.id);
	this.socket = new SocketInterface(this._directSocket, 'cliCode');
	this._template = 'windowTemplate.ejs';
	
	this.vars = {};
	this.vars.urlForResource = function(){
		return this.urlForResource.apply(self, arguments);
	};
	
	//window as socket interface functions
	this.emit = function(){
		this.socket.emit.apply(self.socket, arguments);
	};
	this.on = function(){
		this.socket.on.apply(self.socket, arguments);
	};
	this.once = function(){
		this.socket.once.apply(self.socket, arguments);
	};
	
	this.GUIon = function(){
		this.GUIEvents.on.apply(self.GUIEvents, arguments);
	};
	
	//vars for getters & setters
	this._windowGUI = {
		 width: 100
		,height: 100
		,posTop: 100
		,posLeft: 100
		,title: 'Untitled'
	};
	
	['width', 'height', 'posTop', 'posLeft', 'title'].forEach(function(property){
		self.__defineGetter__(property, function(){
			return self._windowGUI[property];
		});
		self.__defineSetter__(property, function(value){
			self._windowGUI[property] = value;
			//trigger sending the new 'value' for 'property'
			self._directSocket.emit('updateGUIvar', property, value);
		});
	});
	
	this._directSocket.on('updateGUIvar', function(property, value){
		self._windowGUI[property] = value;
	});
	
	this._directSocket.once('close', function(){
		self.close();
	});
	
	this._directSocket.on('move', function(wasUser){
		self.GUIEvents.emit('move', wasUser);
	});
	this._directSocket.on('resize', function(wasUser){
		self.GUIEvents.emit('resize', wasUser);
	});
}

Window.prototype.urlForResource = function(resourcePath){
	return '/app/' + process.pid + '/w_' + this.id + '/' + encodeURIComponent(resourcePath);
};

Window.prototype.render = function(filePath, cb, isRecover){
	var self = this;
	this.filePath = filePath;
	socket.emit('setWindowPath', this.id, filePath + '/window_resources/');
	getScreenSize(function(screenSize){
		if(self._windowGUI.posTop == -1)
			self._windowGUI.posTop = (screenSize.height-self._windowGUI.height)/2;
		if(self._windowGUI.posLeft == -1)
			self._windowGUI.posLeft = (screenSize.width-self._windowGUI.width)/2;
			
		useModule('windowRender').renderWindow(filePath, self, function(code){
			if(!isRecover){
				currentWindows[self.id] = self;
		
				numWindows++;
				//launcher code
				if(numWindows == 1){
					socket.emit('setLauncherRunning', true);
					app.running = true;
				}
			}
			//window code
			socket.emit('newWindow', code);
			self._directSocket.on('connect', function(){
				if(typeof cb == 'function'){
					cb();
				}
			});
		});
	}); //getScreenSize
};

Window.prototype.focus = function(){
	this._directSocket.emit('focus');
};

Window.prototype.close = function(){
	var self = this;
	var closeFunc = function(){
		if(--numWindows == 0){
			socket.emit('setLauncherRunning', false);
			app.running = false;
		}
		self.GUIEvents.emit('close');
		self._directSocket.emit('close');
		delete(currentWindows[self.id]);
	}
	
	if(typeof self.onClose == 'function'){
		self.onClose(function(canClose){
			if(canClose || typeof(canClose) == 'undefined')
				closeFunc();
		});
	} else {
		closeFunc();
	}
};

function recoverWindows(){
	for(var windowID in currentWindows){
		var window = currentWindows[windowID];
		if(typeof window.onRecover == 'function'){
			window.onRecover(function(){
				window.render(window.filePath, function(){}, true);
			});
		} else {
			window.render(window.filePath, function(){}, true);
		}
	}
}

exports.Window = Window;
exports.recoverWindows = recoverWindows;
exports.currentWindows = currentWindows;



//functions 
var getScreenSize;
(function(){
	var callbacks = {};
	getScreenSize = function(cb){
		var cbID = makeID(5);
		callbacks[cbID] = cb;
		socket.emit('getScreenSize', cbID);
	};
	socket.on('getScreenSize', function(cbID, size){
		callbacks[cbID](size);
		delete(callbacks[cbID]);
	});
})();