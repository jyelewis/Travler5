var fs = require('fs');
var async = require('async');

//window constructor function
function Window(){
	var self = this;
	this.appID = __app.id;
	this.id = makeID();
	this.processKey = processKey;
	
	this.code = false;
	
	//vars for getters & setters
	var windowPos = {
		 width: 100
		,height: 100
		,posTop: 100
		,posLeft: 100
	};
	
	['width', 'height', 'posTop', 'posLeft'].forEach(function(property){
		self.__defineGetter__(property, function(){
			return windowPos[property];
		});
		self__defineSetter(property, function(value){
			//trigger sending the new 'value' for 'property'
			windowPos[property] = value;
		});
	});
}

Window.prototype.load = function(filePath, callback){
	var asyncFuncs = [];
	var scripts = {};
	var modules = {};
	['ejs', 'scss', 'js'].forEach(function(scriptType){
		asyncFuncs.push(function(cb){
			fs.readFile(filePath + '/window.' + scriptType, function(err, data){
				if(err) throw err;
				scripts[scriptType] = data.toString();
				cb();
			});
		});
	});
	
	asyncFuncs.push(function(cb){
		fs.readdir(filePath + '/window_modules/', function(files){
			var asyncFiles = [];
			files.forEach(function(file){
				asyncFiles.push(function(cb1){
					fs.readFile(filePath + '/window_modules/' + file, function(err, data){
						if(err) throw err;
						modules[file] = data.toString();
						cb1();
					}); //end fs.readFile
				}); //end asyncFiles.push
			}); //end files.forEach
			async.parallel(asyncFiles, cb);
		}); //end fs.readdir
	}); //end asyncFuncs.push
	
	async.parallel(asyncFuncs, function(){
		 //here scripts and modules are populated
	});
};



exports.Window = Window;