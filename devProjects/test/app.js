var async = require('async');
var fs = require('fs');
var testWindowCreate = useModule('testWindow');

var appInfo = {
	name: 'test app',
	icon: ''
};

exports.init = function(getApp){
		getApp(appInfo, run);
};
var windowOrder = 4;
function run(app){
	app.on('launch', function(){
		testWindowCreate(app, 1);
		testWindowCreate(app, 2);
		testWindowCreate(app, 3);
	});
}