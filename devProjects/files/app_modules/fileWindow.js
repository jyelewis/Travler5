exports.createWindow = function(app){
	var newWindow = app.createWindow();
	newWindow.UI.html = loadResource('/windows/main/main.html');
	newWindow.UI.css  = loadResource('/windows/main/main.css');
	newWindow.UI.js   = loadResource('/windows/main/main.js');
	newWindow.UI.render();
};