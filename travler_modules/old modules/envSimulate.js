var fs = require('fs');

exports.simulate = function(appExe, appPath){
	var appCodeRaw = fs.readFileSync(appExe + '.js');
	
	//setup simulation vars
	var module = { exports:{} };
	var exports = module.exports;
	
	var loadResource = function(path, callback){
		var file = fs.readFileSync(appPath + '/resources_server' + path);
		if(typeof callback == 'function'){
			callback(null, file);
		} else {
			return file;
		}
	}
	var loadClientResource = function(path, callback){
		var file = fs.readFileSync(appPath + '/resources_client' + path);
		if(typeof callback == 'function'){
			callback(null, file);
		} else {
			return file;
		}
	};
	var resourcePath = function(path){
		return appPath + '/resources_physical' + path;
	};
	//var useModule = null;
	var useModule = function(modName){
		var path = appPath + '/app_modules/' + modName + '.js';
		if(fs.existsSync(path)){
			var module = { exports:{} };
			var exports = module.exports;
			var moduleCodeRaw = fs.readFileSync(path);
			eval(moduleCodeRaw.toString());
			return module.exports;
		}
		console.log('unable to load module ' + modName);
	};
	var __dirname = appPath;
	eval(appCodeRaw.toString());
	return module.exports;
};