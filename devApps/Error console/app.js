appConfig({
	id: 'com.jyelewis.errorConsole',
	name: 'Error console',
	framework: '1.1b',
	icon: false
});

function main(app){
	app.on('launch', function(){
		var window = new app.Window();
		
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
		var title = (error.type == 'system')? "System error" : "Application error ("+error.application+")";
		app.prompt(title, error.message);
	});
}