var appManager = useModule('appManager');
var fs = require('fs');
var reqStr = '/app/:processID';
exports.attach = function(mainApp){
	mainApp.all(reqStr + '/icon.png', function(req, res){
		var app = appManager.processes[req.params.processID];
		if(app){
			var icon = app.icon;
			res.type('image/png');
			res.write(icon);
			res.end();
		} else {
			res.send(404);
			res.end('not found');
		}
	});

	mainApp.all(reqStr + '/:rType/:fileID', function(req, res){
		//one day find a way to validate this request, dont want randoms stealing files
		var app = appManager.processes[req.params.processID];
		app.frameworkScript.networkRequest(req, res, req.params.rType, req.params.fileID);
	});
};