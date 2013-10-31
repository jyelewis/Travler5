appConfig({
	id: 'com.jyelewis.working',
	name: 'some test app',
	framework: 'testing',
	icon: false
});

function main(app){
	var fs = require('fs');
/*	app.useModule('name').sayName();
	app.loadResource('/test.txt', function(err, file){
		if(err) throw err;
		console.log(file.toString());
	});*/
	app.on('launch', function(){
//		app.shakeLauncher();
		var window = new app.Window();
		
		
		window.width = 300;
		window.height = 300;
		window.title = 'hello';
		
		window.vars.test = 'hello this is a test';
		window.vars.image = window.getResourceURL('test.png');
			
		window.render('/Users/jyelewis/Dev/node/travler/applications/test/window', function(){
			window.on('bell', function(){
				fs.writeFileSync('/Users/jyelewis/Documents/lightToggle/bellState', '1');
			});
			
			window.GUIon('move', function(){
				//console.log(window.posTop)
			});
		});
		
		window.onRecover = function(cb){
			window.vars.test = 'has been recovered';
			cb();
		};
		
	});
}