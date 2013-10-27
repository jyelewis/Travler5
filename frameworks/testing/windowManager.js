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
	this.GUIEvents = new EventEmitter();
	this._directSocket = new SocketInterface(cliSocket, 'window_'+this.id);
	this.socket = new SocketInterface(this._directSocket, 'cliCode');
	
	this.vars = {};
	
	//window as socket interface functions
	this.emit = function(){
		this.socket.emit.apply(this.socket, arguments);
	};
	this.on = function(){
		this.socket.on.apply(this.socket, arguments);
	};
	this.once = function(){
		this.socket.once.apply(this.socket, arguments);
	};
	
	this.GUIon = function(){
		this.GUIEvents.on.apply(this.GUIEvents, arguments);
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
			//trigger sending the new 'value' for 'property'
			self._windowGUI[property] = value;
		});
	});
	
	this._directSocket.on('close', function(){
		if(--numWindows == 0){
			socket.emit('setLauncherRunning', false);
		}
		self._directSocket.emit('close');
	});
	
}

Window.prototype.render = function(filePath, cb){
	var self = this;
	useModule('windowRender').renderWindow(filePath, this, function(code){
		currentWindows[self.id] = self;
		numWindows++;
		//launcher code
		if(numWindows == 1){
			socket.emit('setLauncherRunning', true);
		}
		
		//window code
		socket.emit('newWindow', code);
		self._directSocket.on('connect', function(){
			cb();
		});
	});
};



exports.Window = Window;

