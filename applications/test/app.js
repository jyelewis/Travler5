appConfig({
	id: 'com.jyelewis.working',
	name: 'some test app',
	framework: 'testing',
	icon: false
});

function main(app){
/*	app.useModule('name').sayName();
	app.loadResource('/test.txt', function(err, file){
		if(err) throw err;
		console.log(file.toString());
	});*/
	app.on('launch', function(){
//		app.shakeLauncher();
		var window = new app.Window();
		window.render('/Users/jyelewis/Dev/node/travler/applications/test/window');
		
	});
}