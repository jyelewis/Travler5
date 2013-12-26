exports.show = function(app, username){
	var userData = app.useModule('userData');
	userData.getUserList(function(users){
	
		var window = new app.Window();
		window.width = 500;
		window.height = 350;
		window.posTop = 300;
		window.posLeft = 300;
	
		window.title = "Preferences";
		
		window.vars.users = users;
		//window.vars.config = {};
		//window.vars.config.port = travlerConfig.port;
		
		window.render(app.root+'/userListView');
		
		var preferencesView = app.useModule('preferencesView');
		//window events
		window.on('usernameClick', function(user){
			preferencesView.show(app, user, true);
		});
		/*window.on('changePort', function(newPort){
			travlerConfig.port = newPort;
			saveConfigFile();
		});*/
	});
};