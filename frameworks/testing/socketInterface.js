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
		this._socket.send({
			event: event,
			args: args,
		});
	} else {
		this._socket.emit(this.socketEvent, {
			event: event,
			args: args,
		});
	}
};
//end client compatible code


module.exports = exports = SocketInterface;