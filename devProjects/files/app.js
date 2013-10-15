var modFileWindow = useModule('fileWindow');

var appInfo = {
	name: 'File manager'
};

exports.init = function(callback){
	callback(appInfo, main);
};

function main(app){
	app.on('launch', function(){
		modFileWindow.createWindow(app);
	});
}