var fileTransfer = function(filePath){
	this.filePath = filePath;
	this.id = makeID(5);
	this.url = '/app/'+ process.pid +'/resource/'+this.id;
	socket.emit('ftBindURL', this.id, this.filePath);
};


fileTransfer.prototype.end = function(){
	socket.emit('ftDeleteURL', this.id);
};


exports.fileTransfer = fileTransfer;