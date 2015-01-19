var fs = require('fs');
var appLauncher = app.useModule("appLauncher");
var currentApp = null;

app.on('launch', function(){
	appState = "select";
	var window = new app.Window();
	
	window.width = 300;
	window.height = 300;
	window.posTop = 50;
	window.posLeft = 50;
	window.title = 'App launcher';
	
	var runningApp = null;
	var runningAppName = null;
	var appState;
		
	//bind window socket events
	var launchApp = function(appName){
		if(!appName || runningApp) return;
		var path = app.sysroot + '/devApps/' + appName;
		runningAppName = appName;
		appLauncher.startApp(path, function(err, pid){
			if(err) console.log(err);
			appLauncher.launchApp(pid);
			runningApp = pid;
			setAppState("running");
			
			appLauncher.onAppRelaunch(pid, function(newPid){
				runningApp = newPid;
				//stop the thing
				appLauncher.launchApp(newPid);
				setAppState("running");
			});
		});
		setAppState("loading");
	};
	
	window.on('launch', launchApp);
	
	window.on('stop', function(){
		if(runningApp){
			appLauncher.killApp(runningApp);
			runningApp = null;
			runningAppName = null;
		}
		setAppState("select");
	});
	
	window.on('restart', function(){
		if(runningApp){
			setAppState("loading");
			appLauncher.killApp(runningApp);
			runningApp = null;
			setTimeout(function(){
				launchApp(runningAppName);
			},1000);
		}
	});
	
	window.on('newProject', function(){
		require('./newProject').newProject(app, function(newProjectName){
			//reload project list
			if(newProjectName){
				window.emit('addProject', newProjectName);
			}
		});
	});
	
	window.on('click', function(){
		if(runningApp){
			appLauncher.launchApp(runningApp);
		}
	});
	//end bind window socket events
	
	
	fs.readdir(app.rootDir + '/../../devApps', function(err, list){
		if(err) throw err;
		var apps = [];
		list.forEach(function(fileName){
			if(fileName.substring(0,1) != '.') //filter out hidden files
				apps.push(fileName);
		});
		window.vars.apps = apps;
		
		window.render('window', function(){
			setAppState(appState);
		});
	});
	
	
	window.onRecover = function(cb){
		cb();
	};
	
	window.onClose = function(cb){
		if(runningApp){
			appLauncher.killApp(runningApp);
			runningApp = null;
			runningAppName = null;
		}
		cb(true);
	};
	
	function setAppState(state){
		//sets what the app should look like
		window.emit('setState', state);
		if(state == 'select'){
			window.title = "App launcher";
		} else if(state == "loading"){
			window.title = "App launcher - " + runningAppName + " - loading";
		} else if(state == "running"){
			window.title = "App launcher - " + runningAppName;
		}
		appState = state;
	}
});











