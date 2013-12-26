//start client compatible code
function SocketInterface(socket, key, isThreadInterface){
	this._listners = {};
	this.key = key;
	this._socket = socket;
	this.isThreadInterface = isThreadInterface;
	var self = this;
	this.socketEvent = isThreadInterface? 'message' : 'INTERFACE.'+this.key;
	socket.on(this.socketEvent, function(eventObj){
		if(typeof self._listners[eventObj.event] === 'undefined') return;

		for(var i=0; i<=self._listners[eventObj.event].length-1; i++){
			if(self._listners[eventObj.event][i]){
				(function(eventFunc){
					var funcCall = function(){ eventFunc.apply({}, eventObj.args); };
					if(typeof process !== 'undefined')
						process.nextTick(funcCall);
					else
						setTimeout(funcCall, 0);
				})(self._listners[eventObj.event][i].func);
				if(self._listners[eventObj.event][i].once){
					delete(self._listners[eventObj.event][i]);
				}
			}
		}
	});
}

SocketInterface.prototype.on = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:false});
};

SocketInterface.prototype.once = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:true});
};

SocketInterface.prototype.emit = function(event){
	var args = [];
	for(var i=1; i<=arguments.length-1; i++){
		args.push(arguments[i]);
	}
	if(this.isThreadInterface){
//		if(!this._socket.killed){
			this._socket.send({
				event: event,
				args: args,
			});
//		} else {
//			console.log('WARNING: Attempted to send message to dead process');
//		}
	} else {
		this._socket.emit(this.socketEvent, {
			event: event,
			args: args,
		});
	}
};
//end client compatible code

/*
function AppSocket(socket, appID){
	this.sendSocket = socket;
	this.appID = appID;
	this.rcvSocket = SocketInterface(socket, 'appSocket_'+appID);
	this._listners = {};
	var self = this;
	
	this.rcvSocket.on('appSocketMessage', function(evntObj){
		for(var i=0; i<=self._listners[eventObj.event].length-1; i++){
			if(self._listners[eventObj.event][i]){
				(function(eventFunc){
					var funcCall = function(){ eventFunc.apply({}, eventObj.args); };
					if(typeof process !== 'undefined')
						process.nextTick(funcCall);
					else
						setTimeout(funcCall, 0);
				})(self._listners[eventObj.event][i].func);
				if(self._listners[eventObj.event][i].once){
					delete(self._listners[eventObj.event][i]);
				}
			}
		}
	});
}

AppSocket.prototype.on = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:false});
};

AppSocket.prototype.once = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:true});
};

AppSocket.prototype.emit = function(){
	var args = [];
	for(var i=0; i<=arguments.length-1; i++){
		args.push(arguments[i]);
	}
	this.sendSocket.emit('appSocketMessage', {
		appID: this.appID,
		args: args
	});
};*/

module.exports = exports = SocketInterface;
