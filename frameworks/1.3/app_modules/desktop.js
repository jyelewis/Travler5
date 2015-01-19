exports.getScreenSize = function(cb){
	app.fwSocket.req('screenSize', cb);
};