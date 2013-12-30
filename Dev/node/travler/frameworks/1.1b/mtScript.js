//mtApp file runs on the main thread to allow mt tasks to run from the app framework
var fs = require('fs');
var appManager = require('../../travler_modules/appManager.js');
var userManager = require('../../travler_modules/userManager.js');

var windowPaths = {};
var resourcePaths = {};

//MUST handle fatalError, newWindow
//SHOULD handle setLauncherShake, setLauncherRunning
//CAN handle click, recover, die
exports.bindEvents = function(mtApp){
	mtApp.socket.on('fatalError', function(err){
		console.log('Application error: ' + ' ('+mtApp.id+')\n\t' + err);
		mtApp.user.error(err, mtApp.id);
		mtApp.forceKill();
		//relaunch app and stuff here
		setTimeout(function(){
			appManager.launchApp(mtApp.rootDir, mtApp.user, function(err, app){
				if(err){
					console.log('Error on app relaunch ('+mtApp.id+')');
				} else {
					app.user.apps[app.id] = app;
					app.user.desktop.reloadAppList();
					mtApp.emit('relaunch', app);
				}
			});
		}, 1000);
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
				app.user.apps[app.id] = app;
				app.user.desktop.reloadAppList();
				app.on('relaunch', function(newApp){
					mtApp.socket.emit('appRelaunched', app.process.pid, newApp.process.pid);
				});
			}
		});
	});
	mtApp.socket.on('appLaunch', function(processID){
		var app = appManager.processes[processID];
		if(app)
			app.emit('click');
	});
	
	mtApp.socket.on('appKill', function(processID){
		var app = appManager.processes[processID];
		if(app){
			app.kill();
		}
	});
	//end appLauncher.js
	
	//handle userData.js
	mtApp.socket.on('getUserData', function(username){
		mtApp.socket.emit('getUserData', userManager.getUserData(username));
	});
	
	mtApp.socket.on('setPassword', function(username, newPassword){
		userManager.changePassword(username, newPassword);
	});
	
	mtApp.socket.on('saveUserData', function(username, changes){
		userManager.saveUserData(username, changes);
	});
	
	mtApp.socket.on('getUserList', function(){
		var userList = [];
		for(var user in userManager.users){
			if(userManager.users[user].username)
				userList.push(user);
		}
		mtApp.socket.emit('getUserList', userList);
	});
	//end userData.js
	
	//desktop.js
	mtApp.socket.on('getScreenSize', function(cbID){
		if(mtApp.user.desktop)
			mtApp.socket.emit('getScreenSize', cbID, mtApp.user.desktop.size);
		else
			mtApp.socket.emit('getScreenSize', cbID, null);
	});
	//end desktop.js
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








