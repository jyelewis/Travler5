var async = require('async');
var fs = require('fs');

var appInfo = {
	name: 'Word'
};

exports.init = function(getApp){
	appInfo.icon = loadResource('/icon.svg');
	getApp(appInfo, run);
};

function run(app){
	var editData = '';
	app.on('launch', function(){
		var window = app.createWindow();
		window.UI.title('Test');
		window.UI.html = loadResource('/page.html');
		window.UI.css  = loadResource('/page.css');
		window.UI.js   = loadResource('/page.js');
		window.UI.render();
		window.UI.recover = function(){
			return {editData:editData};
		};
		window.UI.on('freeze', function(data){
			editData = data.editData;
		});
	});
}