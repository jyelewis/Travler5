var Threads = require('webworker-threads');

function loadThread(){

var thread = Threads.create();
	thread.on('count', function(i){
		thread.emit('count', i);
	});

	thread.load('threadCode.js');
}
loadThread();