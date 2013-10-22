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
		app.shakeLauncher();
	});
}