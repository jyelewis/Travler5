var FileTransfer = function(filePath){
	this.filePath = filePath;
	this.id = makeID(5);
	this.url = '/app/'+ process.pid +'/resource/'+this.id;
	app.fwSocket.emit('ftBindURL', this.id, this.filePath);
};


FileTransfer.prototype.end = function(){
	app.fwSocket.emit('ftDeleteURL', this.id);
};


exports.FileTransfer = FileTransfer;


function makeID(length) { //global function
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'a' + text; //always put a letter at the begining
}