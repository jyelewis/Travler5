var fs = require('fs');

exports.newProject = function(app, callback){
	var window = new app.Window();
	
	window.width = 300;
	window.height = 150;
	window.posTop = 50;
	window.posLeft = 700;
	window.title = "Create new project";
	
	fs.readdir(app.root + '/../../frameworks', function(err, list){
		if(err) throw err;
		var frameworks = [];
		list.forEach(function(fileName){
			if(fileName.substring(0,1) != '.') //filter out hidden files
				frameworks.push(fileName);
		});
		window.vars.frameworks = frameworks;
		
		window.on('createApplication', function(appInfo){
			//appInfo obj name, framework
			var source = app.root + '/../../frameworks/' + appInfo.framework + '/BASEPROJECT';
			var destination = app.root + '/../../devApps/' + appInfo.name;
			
			var ncp = app.useModule('modules/ncp').ncp;
			ncp(source, destination, function (err) {
				if(err) console.log(err);
				setTimeout(function(){
					window.close();
				}, 500);
				callback(appInfo.name);
			});
		})
		
		window.render(app.root + '/windowNewProject', function(){
			
		});
	});
};