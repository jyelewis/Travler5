appConfig({
	id: 'com.jyelewis.working',
	name: 'some test app',
	framework: 'testing',
	icon: false
});

function main(app){
	app.useModule('names').sayName();
	app.loadResource('/test.txt', function(err, file){
		if(err) throw err;
		console.log(file.toString());
	});
	setTimeout(function(){
		app.shakeLauncher();
	}, 1000);
}