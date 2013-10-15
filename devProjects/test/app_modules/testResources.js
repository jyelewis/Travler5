var fs = require('fs');

module.exports = function(socket){
	var path = resourcePath('/message.txt');
	tailFile(socket, path);
	return 1;
};

function tailFile(socket, path){
	var oldFile;
	setInterval(function(){
		var file = fs.readFileSync(path).toString(); //returns a buffer, want a string
		if(file !== oldFile){
			socket.emit('resourceTest', file);
			oldFile = file;
		}
	}, 100);
};