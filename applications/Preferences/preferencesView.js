exports.show = function(app, username, adminView){
	var userData = app.useModule('userData');
	userData.getUserData(username, function(data){
		//userData obj
		/*
		 - background
		 - fullname
		 - launcherApps
		 - username
		 - homedir
		 - isAdmin
		*/
		var window = new app.Window();
		window.width = 500;
		window.height = 350;
		window.posTop = 300;
		window.posLeft = 300;
	
		window.title = "Preferences - " + data.username;
	
		window.vars.user = data;
		window.vars.adminView = adminView;
	
		window.render(app.root+'/preferencesView');
		
		//window events
		window.on('changePassword', function(){
			app.useModule("passwordView").show(app, username);
		});
		
		window.on('save', function(changes){
			if(typeof(changes.launcherApps) != 'undefined'){
				changes.launcherApps = changes.launcherApps.trim().split('\n');
			}
			userData.saveUserData(username, changes);
			window.close();
		});
	});
};