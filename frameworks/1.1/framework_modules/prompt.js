exports.prompt = function(title, message, buttons, cb){
	var promptWindow = new app.Window();
	promptWindow.title = title;
	promptWindow._template = "promptTemplate.ejs";
	
	promptWindow.width = 250;
	promptWindow.height = 130;
	promptWindow.posTop = 100;
	promptWindow.posLeft = -1; //center
	
	if(typeof buttons !== 'object' || buttons.length == 0){
		buttons = ['Ok'];
	}
	
	promptWindow.vars.message = message;
	promptWindow.vars.buttons = buttons;
	promptWindow.vars.buttonWidth = (100/buttons.length).toString() + "%";
	
	promptWindow.render(frameworkDir + "/localCode/promptWindow");
	
	promptWindow.on('btnClick', function(btnName){
		if(typeof cb === 'function'){
			cb(btnName);
		}
		promptWindow.close(); //close the window after the callback runs
		//this ensures the app will not close and relaunch if the callback creates a new window
	});
};