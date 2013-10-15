var appManager = useModule('appManager');
var fs = require('fs');
var reqStr = '/app/:appID';
exports.attach = function(mainApp){
	mainApp.all(reqStr + '/icon.svg', function(req, res){
		var app = appManager.appByID(req.params.appID);
		if(app){
			var icon = app.icon;
			res.type('image/svg+xml');
			res.send(200, icon);
		} else {
			res.send(404);
		}
	});
	mainApp.all(reqStr + '/handle/:path', function(req, res){
		var app = appManager.appByID(req.params.appID);
		if(app){
			var handle = app.requestHandles['/' + req.params.path];
			if(typeof handle === 'function'){
				handle(req, res);
			} else {
				res.send(404);
			}
		} else {
			res.send(404);
		}
	});
	var resourceHandle = function(req, res) {
		var app = appManager.appByID(req.params.appID);
		if(app){
			//look up the resources and send
			if(req.params[0])
				var path = req.params.path + '/' + req.params[0];
			else
				var path = req.params.path;
			path = path.toString().split('?')[0];
			var pathParts = path.split('.');
			var extention = pathParts[pathParts.length-1];
			if(extention == 'svg')
				res.setHeader("Content-Type", "image/svg+xml");
			if(extention == 'js')
				res.setHeader("Content-type", "application/javascript");
			if(extention == 'css')
				res.setHeader("Content-type", "text/css");
			if(extention == 'png')
				res.setHeader("Content-type", "image/png");
			if(extention == 'jpg')
				res.setHeader("Content-type", "image/jpeg");
			res.end(app.loadClientResource('/' + path));
		} else {
			res.send(404);
		}
	};
	mainApp.all(reqStr + '/r/:path', resourceHandle);
	mainApp.all(reqStr + '/r/:path/*', resourceHandle);
};