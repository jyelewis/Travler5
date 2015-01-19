var appManager = require('./../../../travler_modules/appManager.js');
var userManager = require('./../../../travler_modules/userManager.js');

exports.bindEvents = function(mtApp){
	mtApp.socket.once('fatalError', function(errMessage, errStack){
		console.log('Application error: ' + ' ('+mtApp.id+')\n\t' + errStack);
		mtApp.user.error({message:errMessage, stack:errStack}, mtApp.id);
		mtApp.forceKill();
		//relaunch app and stuff here
		if(!mtApp.preventRelaunch){
			setTimeout(function(){
				appManager.launchApp(mtApp.rootDir, mtApp.user, function(err, app){
					if(err){
						console.log('Error on app relaunch ('+mtApp.id+')');
					} else {
						app.user.apps[app.id] = app;
						app.user.desktop.reloadAppList();
						mtApp.emit('relaunch', app);
						
						if(mtApp.parentApp){
							app.on('relaunch', function(newApp){
								mtApp.parentApp.socket.emit('appRelaunched', mtApp.process.pid, app.process.pid);
							});
						}
					}
				});
			}, 800);
		}
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
				app.parentApp = mtApp;
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
	mtApp.socket.onReq('userData', function(username, callback){ ///ooOOo new method :)
		callback(userManager.getUserData(username));
	});
	
	mtApp.socket.on('setPassword', function(username, newPassword){
		userManager.changePassword(username, newPassword);
	});
	
	mtApp.socket.on('saveUserData', function(username, changes){
		userManager.saveUserData(username, changes);
	});
	
	mtApp.socket.onReq('userList', function(callback){
		var userList = [];
		for(var user in userManager.users){
			if(userManager.users[user].username)
				userList.push(user);
		}
		callback(userList);
	});
	//end userData.js
	
	//desktop.js
	mtApp.socket.onReq('screenSize', function(cb){
		if(mtApp.user.desktop)
			cb(mtApp.user.desktop.size);
		else
			cb(null);
	});
	//end desktop.js
	
	
	//stuff that was in app manager
	mtApp.on('click', function(){
		mtApp.socket.emit('click');
	});
	
	mtApp.on('recover', function(){
		mtApp.socket.emit('recover');
	});
	
	mtApp.socket.on('dieReady', function(){
		mtApp.forceKill();
	});
	
	mtApp.on('triggerEvent', function(eventName, arg){
		mtApp.socket.emit('triggerEvent', eventName, arg);
	});
	
	mtApp.rawSocket.on('INTERFACE.cliEvent', function(evntObj){
		mtApp.user.desktop.socket.emit('appEvent_'+mtApp.id, evntObj);
	});
};


//functions
