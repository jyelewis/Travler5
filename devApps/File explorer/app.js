app.on('launch', function(){
	var ExplorerWindow = require('./explorerWindow').ExplorerWindow;
	var explorerWindow = new ExplorerWindow(app.user.homeDir);
});