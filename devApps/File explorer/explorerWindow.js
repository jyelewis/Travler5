var fs = require('fs');
var async = require('async');
var ejs = require('ejs');
var transferFile = require('./transferFile');

var ExplorerWindow = function(dirToShow){
	this.window = new app.Window();
	this.files = [];
	this.rootDir = app.user.homeDir;
	var self = this;
	
	transferFile.bindUpload(self);
	
	this.window.width = 500;
	this.window.height = 300;
	this.window.title = 'File explorer';
	
	
	
	relativePath(self.rootDir, dirToShow, function(err, newPath){
		if (err){ throw err; }
		self.dir = newPath;
		self.window.title = basename(self.dir);
		getDirList(self.rootDir, self.dir, function(files){
			self.files = files;
			renderFileList(files, function(fileList){
				self.window.vars.fileList = fileList;
				self.window.title = basename(self.dir);
				self.window.render('explorerWindow');
			}); //renderFileList
		});//getDirList
	});
	

	//window events
	this.window.on('fileClick', function(fileID){
		//find file by id
		var clickedFile;
		self.files.forEach(function(file){
			if(file.id == fileID){
				clickedFile = file;
			}
		});
		
		if(clickedFile){
			if(clickedFile.isDir){
				self.show(clickedFile.path, "slideLeft");
			} else {
				//open the file
				//var openFile = require('./openFile');
				//openFile.open(clickedFile);
				//openFile.setDefaultApp('image/jpg', 'image viewer');
				transferFile.download(self.rootDir + clickedFile.path);
			}
		}
	});
	
	this.window.on("upDir", function(){
		var pathParts = self.dir.split('/');
		pathParts.pop();
		var newPath = pathParts.join('/');
		if(self.dir != newPath){
			self.show(newPath, "slideRight");
		}
	});
	//end window events
	
	this.window.onRecover = function(cb){
		//update the view on recover, new files and current dir
		getDirList(self.rootDir, self.dir, function(files){
			renderFileList(self.files, function(fileList){
				self.window.vars.fileList = fileList;
				self.window.title = basename(self.dir);
				cb();
			}); //renderFileList
		});//getDirList
	};//window.onRecover
};

ExplorerWindow.prototype.show = function(dir, animation){
	var self = this;
	self.dir = dir;
	getDirList(self.rootDir, self.dir, function(files){
		self.files = files;
		self.window.title = basename(self.dir);
		renderFileList(files, function(code){
			self.window.emit('setFileList', code, animation);
		});
	});
};

ExplorerWindow.prototype.reload = function(){
	this.show(this.dir, 'fade');
};


//functions
function getDirList(rootDir, dir, callback){
	var humanReadable = require('./humanReadable');
	var retFiles = [];
	fs.readdir(rootDir+dir, function(err, files){
		if (err) { throw err; }
		var asyncQue = [];
		files.forEach(function(file){
			if(file.substring(0,1) == '.') return;
			asyncQue.push(function(cb){
				fs.stat(rootDir+dir + '/' + file, function(err, stats){
					if(err) return console.log(err);
					retFiles.push({
						id: makeID(5),
						name: file,
						path:dir+'/'+file,
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
			callback(retFiles);
		});
	});
};

function isSubDir(topDir, dir, callback){
	async.parallel([function(cb){
		fs.realpath(topDir, cb);
	}, function(cb){
		fs.realpath(dir, cb);
	}], function(err, results){
		if (err){
			callback(err, null);
			return;
		}
		//results[0] = realpath(topDir)
		//results[1] = realpath(dir)
		callback(null, results[1].substring(0,results[0].length) == results[0]);
	});
}

function basename(path){
	if(path == '/') return path;
	if(path.substring(path.length-1) == '/'){
		path = path.substring(0, path.length-1); //remove trailing slash
	}
	var parts = path.split('/');
	var endDirName = parts[parts.length-1];
	delete(parts);
	return endDirName;
}

function renderFileList(files, callback){
	fs.readFile(app.rootDir + '/fileListTemplate.ejs', function(err, data){
		if(err) throw err;
		callback(ejs.render(data.toString(), {files:files}));
	});
};

function stringTrailingSlash(str){
	if(str[str.length-1] == '/'){ //has trailing slash
		return str.substring(0, str.length-1);
	}
}

function relativePath(topPath, path, callback){
	async.parallel([function(cb){
		fs.realpath(topPath, cb);
	}, function(cb){
		fs.realpath(path, cb);
	}], function(err, results){
		if (err){
			callback(err, null);
			return;
		}
		//results[0] = realpath(topPath)
		//results[1] = realpath(path)
		if (results[1].substring(0,results[0].length) == results[0]){
			callback(null, results[1].substring(results[0].length, results[1].length));
		} else {
			callback(new Error("Path given not root dir of top path"), null);
		}
	});
}

function makeID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'a'+text; //start with char
}

exports.ExplorerWindow = ExplorerWindow;