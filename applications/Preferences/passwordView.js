exports.show = function(app, username){
	var userData = app.useModule('userData');
	var window = new app.Window();
	window.width = 250;
	window.height = 130;
	window.posTop = 100;
	window.posLeft = 300;

	window.title = "Change password - " + username;

	window.render(app.root+'/passwordView');
	
	window.on('setPassword', function(newPass){
		userData.setPassword(username, newPass);
		window.close();
	});
};