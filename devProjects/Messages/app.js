var fs = require('fs');
//var appManager = require('../../logic/appManager.js');

var appInfo = {
	name: 'Messages'
};
var messageLog = [];

exports.init = function(getApp){
	fs.readFile(__dirname + '/icon.png', function(err, data){
		if(err){ throw err; }
		appInfo.icon = data;
		getApp(appInfo, run);
	});
};

function run(app){
	app.on('launch', function(){
	//	appManager.launchApp(appManager.appByName("Travlr3 VM").id);
		createMessageWindow(app);
	});
}

function createMessageWindow(app){
	var window = app.createWindow();
	window.name = 'anonymous';
	window.UI.title('Messages - ' + window.name);
	window.UI.width(250);
	window.UI.height(500);
	window.UI.load({
		html: '/page.html',
		css:  '/page.css',
		js:   '/page.js'
	}, function(){
		window.UI.render();
	});
	
	window.UI.on('ready', function(){
		window.on('sendMessage', function(message){
			var toSend = window.name + ': ' + message;
			for(i in app.windows){
				var currWindow = app.windows[i];
				currWindow.emit('showMessage', toSend);
			}
			messageLog.push(toSend);
		});
		window.on('setName', function(name){
			window.name = name;
			window.UI.title('Messages - ' + name);
		});
		window.on('newWindow', function(){
			createMessageWindow(app);
		});
		window.UI.recover = function(){
			return {
				messages: messageLog
			};
		};
	});
}