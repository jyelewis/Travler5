var fs = require('fs');
var crypto = require('crypto');

exports.save = function(key, data, cb){
	var key = hashString(JSON.stringify(key));
		var dataPath = app.user.homeDir + '/.travlerconf/appData/'+app.id+'/';
		var filePath = dataPath + key;
		checkDir(dataPath, function(){
			fs.writeFile(filePath, JSON.stringify(data), function(){
				if(cb)
					cb();
			});
		});
};

exports.load = function(key, cb){
	var key = hashString(JSON.stringify(key));
		var dataPath = app.user.homeDir + '/.travlerconf/appData/'+app.id+'/';
		var filePath = dataPath + key;
		fs.readFile(filePath, function(err, data){
			var obj;
			if(!err){
				obj = JSON.parse(data);
			}
			cb(err, obj);
		});
};


function hashString(string){
	var hash = crypto.createHash('sha256');
	hash.update(string);
	return hash.digest('hex');
}

function checkDir(dataPath, cb){
	fs.exists(dataPath, function(exists){
		if(!exists){
			fs.mkdir(dataPath, cb);
		} else {
			cb();
		}
	});
}