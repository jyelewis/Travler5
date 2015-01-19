var fs = require('fs');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var SocketInterface = require('./socketInterface.js');
var windowRender = require('./windowRender.js');

var currentWindows = {};
var numWindows = 0;

//window constructor function
function Window(){
	var self = this;
	this.appID = app.id;
	this.id = makeID(5);
	this.code = false;
	this.filePath = false;
	this.GUIEvents = new EventEmitter();
	this._directSocket = new SocketInterface(app.cliSocket, 'window_'+this.id);
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
	this.filePath = filePath[0] == '/'? filePath : app.rootDir + '/' + filePath;
	app.fwSocket.emit('setWindowPath', self.id, this.filePath + '/window_resources/');
	getScreenSize(function(screenSize){
		if(self._windowGUI.posTop == -1)
			self._windowGUI.posTop = (screenSize.height-self._windowGUI.height)/2;
		if(self._windowGUI.posLeft == -1)
			self._windowGUI.posLeft = (screenSize.width-self._windowGUI.width)/2;
		
		windowRender.renderWindow(self.filePath, self, function(err, code){
			if(err){
				throw err;
			}
			if(!isRecover){
				currentWindows[self.id] = self;
	
				numWindows++;
				//launcher code
				if(numWindows == 1){
					app.fwSocket.emit('setLauncherRunning', true);
					app.running = true;
				}
				
				self._directSocket.on('connect', function(){ //run every time the window is recovered
					if(typeof cb == 'function'){
						cb(!!self.hasBeenRendered);
					}
					self.hasBeenRendered = true;
				});
			}
			//window code
			app.fwSocket.emit('newWindow', code);
			
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
			app.fwSocket.emit('setLauncherRunning', false);
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
		(function(window){
			if(typeof window.onRecover == 'function'){
				window.onRecover(function(){
					window.render(window.filePath, function(){}, true);
				});
			} else {
				window.render(window.filePath, function(){}, true);
			}
		})(currentWindows[windowID]);
	}
}

exports.Window = Window;
exports.recoverWindows = recoverWindows;
exports.currentWindows = currentWindows;



//functions 
function getScreenSize(cb){
	app.fwSocket.req('screenSize', cb);
}


function makeID(length) { //global function
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'a' + text; //always put a letter at the begining
}