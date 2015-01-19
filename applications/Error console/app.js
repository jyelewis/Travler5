
app.on('launch', function(){
	/*var window = new app.Window();
	
	window.width = 300;
	window.height = 300;
	window.title = 'Error console';
		
	window.render(app.root + '/window', function(){
		//this window should show a list of errors
	});
	
	/*
	window.onRecover = function(cb){
		//code to run before recovery render
		cb();
	};
	
	window.onClose = function(cb){
		//code to run before closing
		cb(true);
	};
	*/
});

app.on('newError', function(error){
	var title = (error.type == 'system')? "System error" : "Error ("+error.app+")";
	var buttons = ['ok'];
	if(error.stack){
		buttons.push('stack');
	}
	app.prompt(title, error.message, buttons, function(btnPressed){
		if(btnPressed == 'stack'){
			var winStack = new app.Window();
			winStack.width = 800;
			winStack.height = 200;
			winStack.posTop = 100;
			winStack.posLeft = -1; //center
			winStack.title = (error.type == 'system')? "System error stack":"Error stack for "+error.app;
			
			winStack.vars.stack = error.stack;
			
			winStack.render('stackWindow');
		}
	});
});
