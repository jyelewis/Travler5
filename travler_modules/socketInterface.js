function SocketInterface(socket, key){
	this._listners = {};
	this.key = key;
	this._socket = socket;
	var self = this;
	socket.on('INTERFACE.'+this.key, function(eventObj){
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
	this._socket.emit('INTERFACE.'+this.key, {
		event: event,
		args: args,
	});
};



module.exports = exports = SocketInterface;