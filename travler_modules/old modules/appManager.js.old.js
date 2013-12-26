var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');
var windowManager = useModule('windowManager');
var startEvents = useModule('startEvents');
var envSimulate = useModule('envSimulate');
var domain = require('domain');
var crypto = require('crypto');
var launcherManager;
process.nextTick(function(){ //this is becuase if they both load eachother instantly it will get stuck
	launcherManager = useModule('launcherManager');
});

var apps = {name:{}, id:{}};
exports.apps = apps.id;

var appDir;
var tempDir;
var appDefaultImage = loadResource('/images/appDefault.svg');

var App; //define the varible for the app constructor

startEvents.new('appManager', ['loadConfig', function(initCallback){
appDir = __sysroot + '/applications/';
tempDir = __sysroot + travlerConfig.temp + '/';
	//recreate the temp dir clean
	//deleteFolderRecursive(tempDir);
	//fs.mkdir(tempDir);
	fs.readdir(appDir, function(err, list){
		if(err){ throw err; }
		var asyncList = [];
		list.forEach(function(appName){
			if(appName.substring(0,1) == '.'){ return; } //if begins with . (is hidden) dont add it
			var appPath = appDir + appName;
			asyncList.push(function(callback){
				if(fs.statSync(appPath).isDirectory()) {
					loadApplication(appPath + '/app', appPath, callback);
				} else if(appName.substring(appName.length-5).toLowerCase() === '.travler') {
					var fileHash;
					var md5sum = crypto.createHash('md5');
					var s = fs.ReadStream(appPath);
					s.on('data', function(d) {
						md5sum.update(d);
					});
					s.on('end', function() {
						fileHash = md5sum.digest('hex');
						var tempPath = tempDir + fileHash;
						if(fs.existsSync(tempPath)){
							loadApplication(tempPath + '/build/index.js', appPath, callback);
						} else {
							new targz().extract(appPath, tempPath, function(err){
								if(err){ console.log('Application loading fail: ' + appPath); }
								loadApplication(tempPath + '/build/index.js', appPath, callback);
							});
						}
					});
				} else {
					console.log('Warning: non-application in applications directory (' + appPath + ')');
					callback();
				}
			});
		}); //end list.forEach
		async.parallel(asyncList, function(err, results){
			initCallback();
		});
	}); //end readdir
}]);

function loadApplication(appExe, appPath, loadCallback){							  
	try {
		var appExports = require(appExe);
		appExports.init(function(appData, run){
			var crashCount = 0; //only allow the app to crash so many times
			//by putting the application setup in a function we are able
			//to call it again later if an error occours		
			var executeApp = function(){
				//create a domain for the app to run in
				var appDomain = domain.create();
				
				//the returned "app" var should contain name and icon
				//we want a separate instance here with only what we want
				var appObj = new App({
					oldObj: apps.name[appData.name],
					name: appData.name,
					icon: checkIcon(appData.icon) || appDefaultImage, //fallback to default image
					path: appPath,
					crashCount: crashCount,
					domain: appDomain,
					loadClientResource: appExports.loadClientResource
				});
				
				//bind the domain error handler
				appDomain.on('error', function(err){
					apps.name[appData.name].kill();
					console.log('The application "' + appData.name + '" had a fatal error:\n  '
						+ err.stack + 
						'\n  Restarting process..'
					);

					if(++crashCount > 3){
						console.log('Application in crash loop, giving up');
						return;
					} else {
						process.nextTick(executeApp); //at the next opertunity try again
					}
					//restart the process here
				}); /*function to run if the application has an error at any point
					  the domain will attach itself to all event emitters and timmers
					  which will mean if functions placed on the event loop by the app
					  has an error it is still caught along with the app information*/
		  
				//keep a reference
				apps.id[appObj.id] = appObj;
				apps.name[appObj.name] = appObj;
				var launcherApp = launcherManager.appByID(appObj.id);
				if(launcherApp){
					launcherApp.bind();
				}
			
				process.nextTick(function(){
					appDomain.add(appObj); //the event emitter here needs to be closed too
					appDomain.run(function(){
						//its important that the app run function is the
						//only thing in the domain, otherwise the domain
						//alters the functions within the callbacks. Big issue
						run(appObj);
					}); //end app domain run
				}); //end nextTick bind
				process.nextTick(function(){
					loadCallback(null, appObj);
					loadCallback = function(){}; //we dont want the callback being triggered again
				});
			}; //end executeApp function
			process.nextTick(executeApp); //put the appliction script on the event loop
		}); //end require app file
	} catch(err) {
		var disErr = err.stack || err;
		console.log('Error initiallizing application:\n  '+ disErr);
		loadCallback(); //dont hang the server
	}
} //end load application function

exports.appByID = function(appID){
	if(typeof apps.id[appID] == 'undefined'){
		return false;
	}
	return apps.id[appID];
};

exports.appByName = function(appName){
	if(typeof apps.name[appName] == 'undefined'){
		return false;
	}
	return apps.name[appName];
};
exports.launchApp = function(appID){
	var app = exports.appByID(appID);
	if(!app || app.running){ return false; } //the app id given is invalid
	app.emit('launch');
	return true;
};

//App object
//constructor function
var App = function(appData){
	this.name = appData.name;
	if(appData.oldObj){
		this.id = appData.oldObj.id;
	} else {
		this.id = makeID(5);
	}
	this.icon = appData.icon,
	this.path = appData.path;
	this.domain = appData.domain;
	this.crashCount = appData.crashCount;
	this.loadClientResource = appData.loadClientResource,
	this.running = false;
	this.ports = [];
	this.windows = {};
	this.windowNum = 0; //the number of currently open windows
	this.requestHandles = {}; //for custom http request handle functions
	var self = this;
};
//inherit event emitter for the root object
util.inherits(App, EventEmitter);

//app prototype functions
App.prototype.genWindowID = function(){
	return this.id + "" + makeID(5);
};

App.prototype.kill = function(){
	for(var windowID in this.windows){
		this.windows[windowID].close();
	}
	this.domain.dispose(); //this ends, closes, aborts all
						 //callbacks, timers and requests
						 //therefore killing the app script
	this.removeAllListeners(); //app functions can still be triggered
};

App.prototype.createWindow = function(){
	if(!getSocket()) { return false; } //if there is no client connected return
	var window = new windowManager.Window(this);
	this.windows[window.id] = window;
	if(this.windowNum === 0){
		this.running = true;
		launcherManager.startRunning(this);
		this.emit('windowOpen'); // if the first window is opened emit this
	}
	this.windowNum++;
	return window;
}

App.prototype.bindRequest = function(path, func){
	this.requestHandles[path] = func;
};

exports.setupApplist = function(){
	var socket = getSocket();
	var list = [];
	
	for(var appName in apps.name){
		var app = apps.name[appName];
		list.push({name: app.name, id: app.id});
	};
	list.sort(function(a,b){
		if(a.name<b.name) return -1;
		if(a.name>b.name) return 1;
		return 0;
	});
	socket.emit('desktop.appList', list);
};

//functions
function makeID(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'a' + text; //always put a letter at the begining
}

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

exports.App = App;

function checkIcon(image){ //check if the image is an svg
	if(!image){ return false; }
	if(image.toString().indexOf('</svg>') !== -1){
		return image;
	} else {
		return false; //we can check against this later to return a stock image
	}
}