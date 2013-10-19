
process.title = "Travler server";

var cp = require('child_process');

var process2 = cp.fork(__dirname + '/processCode.js');

process2.on('message', function(i){
	if(i == 100000){
		console.log(i);
		return;
	}
	process2.send(i);
});

process2.send(1);