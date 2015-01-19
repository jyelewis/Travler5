var appManager = useModule('appManager');
var fs = require('fs');
var reqStr = '/app/:processID';
exports.attach = function(mainApp){
	mainApp.all(reqStr + '/icon.png', function(req, res){
		var app = appManager.processes[req.params.processID];
		if(app && app.icon){
			res.sendfile(app.rootDir + '/' + app.icon);
		} else {
			res.sendfile(__sysroot + '/resources_server/images/appDefault.png');
		}
	});

	mainApp.all(reqStr + '/:rType/:fileID', function(req, res){
		//one day find a way to validate this request, dont want randoms stealing files
		var app = appManager.processes[req.params.processID];
		if(app && app.networkRequest)
			app.networkRequest(req, res, req.params.rType, req.params.fileID);
		else {
			res.send(404, 'not found');
		}
	});
};