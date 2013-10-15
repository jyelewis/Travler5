var async = require('async');
var fs = require('fs');

var appInfo = {
	name: 'test app'
};

exports.init = function(getApp){
	fs.readFile(__dirname + '/icon.png', function(err, data){
		if(err){ throw err; }
		appInfo.icon = data;
		getApp(appInfo, run);
	});
};
var windowOrder = 4;
function run(app){
	app.on('launch', function(){
		createWindow(app, 1);
		createWindow(app, 2);
		createWindow(app, 3);
	});
}
function createWindow(app, order){
	var window = app.createWindow();
	/*window.UI.title('my first window');
	window.UI.width(250);
	window.UI.height(200);
	window.UI.top(100);
	window.UI.left(20);*/
	window.UI.title('test window ' + order);
	window.UI.top(order*20+10);
	window.UI.left(order*20+10);
	
	window.UI.load({
		html: '/page.html',
		css: '/page.css',
		js: '/page.js'
	}, function(){
		window.UI.render();
	});
	
	var counter = 1;
	window.UI.on('ready', function(){
		window.on('socketTest', function(){
			counter++;
			if(counter == 5){
				window.shake(500);
			}
			if(counter >= 10){
				window.close();
				return;
			}
			window.emit('socketTest', counter);
			console.log('window: ' + order + ' counter: ' + counter);
		});
		window.emit('socketTest', counter);
	});
	window.UI.recover = function(){
		return({
			counter: counter
		});
	};
	window.UI.on('freeze', function(freezeData){
		
	});
	window.UI.on('load', function(){ //when the window is ready at anytime
	
	});
	window.UI.close = function(){
		//createWindow(app, windowOrder++);
		window.close();
	};
}