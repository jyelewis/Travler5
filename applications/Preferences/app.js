var userListView = require('./userListView');
var preferencesView = require('./preferencesView');

app.on('launch', function(){
		if(app.user.isAdmin){
			userListView.show(app);
		} else {
			preferencesView.show(app, app.user.username, false);
		}
});