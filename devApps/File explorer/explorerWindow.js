var app = __app;
var fs = require('fs');
var async = require('async');

exports.showDir = function(dirToShow){
	var humanReadable = app.useModule('humanReadable');
	var window = new app.Window();
	
	if(dirToShow.substring(dirToShow.length-1) == '/'){
		dirToShow = dirToShow.substring(0, dirToShow.length-1); //remove trailing slash
	}
	var parts = dirToShow.split('/');
	var endDirName = parts[parts.length-1];
	delete(parts);
	
	window.width = 500;
	window.height = 300;
	window.title = /*'File explorer - ' + */ endDirName;
	
	var testDate = new Date();
	testDate.setDate(22);
	testDate.setHours(12);
	
	window.vars.files = [];
	
	fs.readdir(dirToShow, function(err, files){
		var asyncQue = [];
		files.forEach(function(file){
			if(file.substring(0,1) == '.') return;
			
			asyncQue.push(function(cb){
				fs.stat(dirToShow + '/' + file, function(err, stats){
					if(err) return console.log(err);
					window.vars.files.push({
						name: file,
						isDir:stats.isDirectory(),
						icon:false,
						modified: humanReadable.dateToString(stats.mtime.getTime()),
						size: stats.isDirectory()? ' -- ' : humanReadable.filesizeToString(stats.size),
					}); //window.vars.files.push
					cb(null);
				}); //fs.stat
			}); //asyncQue push
			
		});//files.forEach
		
		async.parallel(asyncQue, function(){
			//all files have been added to window.vars.files with their metadata
			window.render(app.root + '/explorerWindow');
		});
	});
	
	/*
	window.onRecover = function(cb){
		//code to run before recovery render
		cb();
	};
	
	window.onClose = function(cb){
		//code to run before closing
		cb(true);
	};
	*/
};