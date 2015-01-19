//start client compatible code
function SocketInterface(socket, key, isThreadInterface){
	this._listners = {};
	this._reqResponders = {};
	this.key = key;
	this._socket = socket;
	this.isThreadInterface = isThreadInterface;
	var self = this;
	this.socketEvent = isThreadInterface? 'message' : 'INTERFACE.'+this.key;
	socket.on(this.socketEvent, function(eventObj){
		if (typeof eventObj.reqID != 'undefined'){
			if (typeof self._reqResponders[eventObj.event] != 'undefined'){
				eventObj.args.push(function(){ //add callback function
					var args = ['REQCALLBACK.'+eventObj.reqID]; //first arg is event
					for(var i=0; i<=arguments.length-1; i++){
						args.push(arguments[i]);
					}
					//emit REQCALLBACK. event to self to trigger return
					self.emit.apply(self, args); //mmmm hax
				});
				self._reqResponders[eventObj.event].apply(null, eventObj.args);
			}
			return; //stop here, dont handle like normal events
		}
		
		if (typeof self._listners[eventObj.event] === 'undefined') return;

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

SocketInterface.prototype.req = function(event){ //event, ..., callback
	if (this.isThreadInterface) return false; //doesnt work over raw thread interface
	var args = [];
	for(var i=1; i<=arguments.length-2 /*miss lass arg*/; i++){
		args.push(arguments[i]);
	}
	var reqID = makeID(5);
	var noCallbackTimer = setTimeout(function(){
		console.log("Warning: no req callback in 5 seconds, is onReq bound");
	}, 5000);
	var cbFunc = arguments[arguments.length-1]
	this.on('REQCALLBACK.'+reqID, function(){
		cbFunc.apply(null, arguments);
		clearTimeout(noCallbackTimer);
	});
	this._socket.emit(this.socketEvent, {
		event: event,
		reqID: reqID,
		args: args,
	});
};

SocketInterface.prototype.onReq = function(event, func){
	this._reqResponders[event] = func;
};
//end client compatible code


module.exports = exports = SocketInterface;

function makeID(length) { //global function
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'a' + text; //always put a letter at the begining
}