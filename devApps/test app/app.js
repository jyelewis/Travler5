appConfig({
	id: 'com.jyelewis.testApp',
	name: 'some test app',
	framework: '1.1',
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
		window.vars.image = window.urlForResource('test.png');
			
		window.render(app.root + '/window');
		
		window.on('bell', function(){
			//fs.writeFileSync('/Users/jyelewis/Documents/lightToggle/bellState', '1');
			app.prompt("test", 'this is a test', ['ok', 'thanks', 'err'], function(btnClicked){
				app.prompt('Selection', 'You clicked the "'+ btnClicked+ '" button, thanks :)');
				if(btnClicked == 'err'){
					asd(); //throw err
				}
			});
		});
		
		window.GUIon('move', function(){
			//console.log(window.posTop)
		});
		
		window.onRecover = function(cb){
			window.vars.test = 'has been recovered';
			cb();
		};
		
		
		//test login events
		/*app.on('lock', function(){
			console.log('lock');
		});
		app.on('unlock', function(){
			console.log('unlock');
		});
		app.on('transfer', function(){
			console.log('transfer');
		});*/
	});
}