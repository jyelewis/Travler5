appConfig({
	id: 'APP IDENTIFICATION',
	name: 'APP NAME',
	framework: '1.1',
	icon: false
});

function main(app){
	app.on('launch', function(){
		var window = new app.Window();
		
		window.width = 300;
		window.height = 300;
		window.title = 'My first app';
			
		window.render(app.root + '/window', function(){
			
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
}