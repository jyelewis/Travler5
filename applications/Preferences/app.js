appConfig({
	id: 'com.jyelewis.preferences',
	name: 'Preferences',
	framework: '1.1b',
	icon: "icon.png"
});

function main(app){
	app.on('launch', function(){
		app.useModule('userData').getUserData(__username, function(data){
			if(data.isAdmin){
				var userListView = app.useModule('userListView');
				userListView.show(app);
			} else {
				var preferencesView = app.useModule('preferencesView');
				preferencesView.show(app, __username, false);
			}
		});
	});
}