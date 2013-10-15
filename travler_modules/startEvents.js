var async = require('async');

var events = {};
var endObjs = {};

function newEvent(name, obj){
	if(typeof obj === 'function'){
		events[name] = function(callback){
			obj(function(){
				callback()
			});	
		}
	} else {
		var asyncFunc = obj[obj.length-1];
		obj[obj.length-1] = function(callback){
			asyncFunc(function(){
				callback()
			});
		}
		endObjs[name] = obj;
	}
	
}

function call(name, callback){
	var event = events[name];
	if(typeof event === 'function'){
		event(callback);
	} else {
		event[event.length-1](callback);
	}
}

function run(callback){
	for(prop in endObjs){
		events[prop] = endObjs[prop]; //any events that rely on others being finished have to be added to the end of the object
	}
	async.auto(events, callback);
}

exports.new = newEvent;
exports.run = run;
exports.call = call;