//mtApp file runs on the main thread to allow mt tasks to run from the app framework
var fs = require('fs');
var appManager = require('../../travler_modules/appManager.js');

var windowPaths = {};
var resourcePaths = {};

//MUST handle fatalError, newWindow
//SHOULD handle setLauncherShake, setLauncherRunning
//CAN handle click, recover, die
exports.bindEvents = function(mtApp){
	mtApp.socket.on('fatalError', function(err){
		console.log('Application error: ' + ' ('+mtApp.id+')\n\t' + err);
		mtApp.process.kill();
		mtApp.emit('exit');
	});
	mtApp.socket.on('setLauncherShake', function(shake){
		if(mtApp.user.connected){
			mtApp.user.desktop.setLauncherShake(mtApp.id, shake);
		}
	});
	mtApp.socket.on('setLauncherRunning', function(state){
		if(mtApp.user.connected){
			mtApp.user.desktop.setLauncherRunning(mtApp.id, state);
		}
	});
	mtApp.socket.on('newWindow', function(code){
		mtApp.user.desktop.socket.emit('newWindow', code);
	});
	
	mtApp.socket.on('setWindowPath', function(windowID, path){
		windowPaths[windowID] = path; //abs path to window
	});
	
	mtApp.socket.on('setResourcePath', function(resourceID, path){
		resourcePaths[resourceID] = path; //abs path to resource
	});
	
	//functions for handling the launching of apps
	mtApp.socket.on('appStart', function(appPath){
		appManager.launchApp(appPath, mtApp.user, function(err, app){
			if(err){
				mtApp.socket.emit('appLaunched', err.message, appPath);
			} else {
				mtApp.socket.emit('appLaunched', null, appPath, app.process.pid);
			}
		});
	});
	mtApp.socket.on('appLaunch', function(processID){
		var app = appManager.processes[processID];
		mtApp.user.apps[app.id] = app;
		app.emit('click');
	});
	mtApp.socket.on('appKill', function(processID){
		var app = appManager.processes[processID];
		if(app){
			app.emit('die');
		}
	});
};


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

exports.networkRequest = function(req, res, rType, fileID){
	var path = findResourcePath(rType, fileID);
	if(path){
		fs.exists(path, function(exists){
			if(exists){
				fs.realpath(path, function(err, path){
					if(err) throw err;
					res.sendfile(path);
				});
			} else {
				res.send(404);
				res.end('404: File not found');
			}
		});
	} else {
		res.send(404);
		res.end('404: File not found');
	}
};








