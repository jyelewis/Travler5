var fs = require('fs');

var windowPaths = {};
var resourcePaths = {};

function bindEvents(app){
	app.socket.on('setWindowPath', function(windowID, path){
		windowPaths[windowID] = path; //abs path to window
	});

	app.socket.on('setResourcePath', function(resourceID, path){
		resourcePaths[resourceID] = path; //abs path to resource
	});
	
	//fileTransfer.js
	app.socket.on('ftBindURL', function(fileID, filePath){
		resourcePaths[fileID] = filePath;
	});
	app.socket.on('ftDeleteURL', function(fileID){
		delete(resourcePaths[fileID]);
	});
	//end fileTransfer.js
	app.networkRequest = networkRequest;
}

function findResourcePath(rType, fileID){
	if(rType.substring(0,2) == 'w_'){
		//request is for a window
		var windowID = rType.substring(2);
		var path = decodeURIComponent(fileID);
		if(typeof windowPaths[windowID] === 'undefined') return false;
		if(path.indexOf('..') !== -1) return false;
		//ligit window, ligit path
		return windowPaths[windowID] + path;
	} else {
		//request is for resource
		if(typeof resourcePaths[fileID] === 'undefined') return false;
		return resourcePaths[fileID];
	}
}

function networkRequest(req, res, rType, fileID){
	var path = findResourcePath(rType, fileID);
	if(path){
		fs.exists(path, function(exists){
			if(exists){
				if(rType.substring(0,2) == 'w_'){
					res.sendfile(path);
				} else {
					res.download(path);
				}
			} else {
				res.send(404, '404 File not found');
			}
		});
	} else {
		res.send(404, '404 File not found');
	}
}


exports.bindEvents = bindEvents;