var util = require('util');
var getSocket = useModule('getSocket').getSocket;
var EventEmitter = require('events').EventEmitter;
var sandbox = useModule('sandbox');
var async = require('async');
var fs = require('fs');
var windows = {};
var WindowSocket;
var Window;

exports.windowByID = function(windowID){
	if(typeof windows[windowID] == 'undefined'){
		return false;
	}
	return windows[windowID];
};

exports.recoverWindows = function(){
	for(id in windows){
		var window = windows[id];
		var recoverData;
		if(typeof window.UI.recover == 'function'){
			recoverData = window.UI.recover();
		}
		window.recover({
			custom: recoverData,
			state: window.UI._freezeState || {}
		});
	}
};

//windowUI - for the client side UI
WindowUI = function(window){
	this.window = window;
	this.html = '';
	this.css = '';
	this.js = '';
	//style aspect
	this._title = this.window.app.name + ' - Untitled window';
	this._height = 300;
	this._width = 400;
	this._top = 20;
	this._left = 20;
	this._ordering = 1;
	
	this.readyRun = false;
	this.rendered = false;
}
//event emitter for UI events (resize, move, blur, focus etc)
util.inherits(WindowUI, EventEmitter);

//UI getters and setters
WindowUI.prototype.title = function(newTitleRaw){
	var retVal = this._title;
	if(newTitleRaw){
		var newTitle = this.window.app.name + ' - ' + newTitleRaw;
		this._title = newTitle;
		if(this.rendered){
			this.window.interfaceEmit('setTitle', newTitle);
		}
	}
	return retVal;
};
WindowUI.prototype.width = function(newWidth){
	var retVal = this._width;
	if(newWidth){
		this._width = newWidth;
		if(this.rendered){
			this.window.interfaceEmit('setWidth', newWidth);
		}
	}
	return retVal;
};
WindowUI.prototype.height = function(newHeight){
	var retVal = this._height;
	if(newHeight){
		this._height = newHeight;
		if(this.rendered){
			this.window.interfaceEmit('setHeight', newHeight);
		}
	}
	return retVal;
};
WindowUI.prototype.top = function(newTop){
	var retVal = this._top;
	if(newTop){
		this._top = newTop;
		if(this.rendered){
			this.window.interfaceEmit('setTop', newTop);
		}
	}
	return retVal;
};
WindowUI.prototype.left = function(newLeft){
	var retVal = this._left;
	if(newLeft){
		this._left = newLeft;
		if(this.rendered){
			this.window.interfaceEmit('setLeft', newLeft);
		}
	}
	return retVal;
};

WindowUI.prototype.render = function(recover){
	if(this.rendered) { return false; }
	var socket = getSocket();
	var self = this;
	/* this.window.id, this.html, this.css, this.js, */
	var code = sandbox.app.all(this, recover, function(code){
		socket.emit('desktop.window.UI', self.window.id, 'render', code);
		self.rendered = true;
	});
};

WindowUI.prototype.load = function(obj, finalCallback){
	var self = this;
	async.parallel({
			html: function(callback){
				fs.readFile(self.window.app.path + obj.html, callback);
			},
			css: function(callback){
				fs.readFile(self.window.app.path + obj.css, callback);
			},
			js: function(callback){
				fs.readFile(self.window.app.path + obj.js, callback);
			}
		}, function(err, results){
			if(err) { throw err; }
			self.html = results.html;
			self.css  = results.css;
			self.js   = results.js;
			finalCallback();
		});
};

//Window constructor function
Window = function(app){
	this.app = app;
	this.id = app.genWindowID();
	this._customEmitter = new EventEmitter();
	this._windowEmitter = new EventEmitter();
	this.UI = new WindowUI(this);
	this.exists = true;
	windows[this.id] = this;
	this.setup(); //runs on both creation and recovery
	this.setupEvents();
};

Window.prototype.setup = function(){
	var socket = getSocket();
	socket.emit('desktop.window.create', this.id);
	this.UI.rendered = false;  	//if setup is running then the whole thing has to be recreated
								//it means at some point the window was lost, most likely in device switch
	var self = this;
	socket.on('disconnect', function(){
		self.UI.rendered = false; //the window no longer exists
	});
};

Window.prototype.setupEvents = function(){
	var self = this;
	this.interfaceOn('load', function(isRecover){
		self.UI.emit('load');
		if(!isRecover){
			self.UI.emit('ready');
		}
	});
	this.interfaceOn('freeze', function(freezeData){
		self.UI._freezeState = freezeData.state;
		self.UI.emit('freeze', freezeData.custom);
	});
	this.interfaceOn('move', function(pos){
		self.UI._top = pos.top;
		self.UI._left = pos.left;
		self.UI.emit('move');
	});
	this.interfaceOn('resize', function(size){
		self.UI._width = size.width;
		self.UI._height = size.height;
		self.UI.emit('resize');
	});
	this.interfaceOn('blur', function(ordering){
		self.UI._ordering = ordering;
		self.UI.emit('blur');
	});
	this.interfaceOn('focus', function(ordering){
		self.UI._ordering = ordering;
		self.UI.emit('focus');
	});
	this.interfaceOn('closeClick', function(){
		self.UI.emit('close');
		if(typeof self.UI.close == 'function'){
			self.UI.close();
		} else {
			self.close();
		}
	});
};

Window.prototype.recover = function(recoverData){
	this.setup();
	this.UI.render(recoverData);
};

Window.prototype.close = function(){
	if(!this.exists){ return false; }
	var socket = getSocket();
	this.exists = false;
	this.app.windowNum--;
	if(this.app.windowNum === 0){
		this.app.running = false;
		this.app.emit('windowClose'); //if the last window is closed emit this
	}
	socket.emit('desktop.window.close', this.id);
	delete(this.app.windows[this.id]); //delete from apps object
	delete(windows[this.id]); //delete from windows object
};

//event emitter for window socket
Window.prototype.interfaceEmit = function(event){
	var socket = getSocket();
	socket.emit('interfaceEmit', {
		type: 'window',
		id: this.id,
		'event': event,
		'arguments': arguments
	});
};

Window.prototype.interfaceOn = function(event, func){
	this._windowEmitter.on(event, func);
};

Window.prototype.emit = function(event){
	var socket = getSocket();
	socket.emit('interfaceEmit', {
			type: 'custom',
			id: this.id,
			'event': event,
			'arguments': arguments
		});
};

Window.prototype.on = function(event, func){
	this._customEmitter.on(event, func);
};

Window.prototype.once = function(event, func){
	this._customEmitter.once(event, func);
};


//window prototype functions
//window.shake makes the applications icon in the launcher bar shake
Window.prototype.shake = function(p){
	var socket = getSocket();
	var appID = this.app.id; //so the window can be closed but still retain id
	if(p === true){ //start shaking if true
		socket.emit('desktop.launcher.alter', appID, 'shake', true);
	} else if(p === false){ //stop shaking if false
		socket.emit('desktop.launcher.alter', appID, 'shake', false);
	} else if(typeof p === 'number'){ //shake for number of millies given
		socket.emit('desktop.launcher.alter', appID, 'shake', true);
		var self = this;
		setTimeout(function(){
			socket.emit('desktop.launcher.alter', appID, 'shake', false);
		}, p);
	} else { //default to shaking for 800 milies
		socket.emit('desktop.launcher.alter', appID, 'shake', true);
		setTimeout(function(){
			socket.emit('desktop.launcher.alter', appID, 'shake', false);
		}, 800);
	}
};

exports.Window = Window;