appConfig({
	id: 'com.addisonlewis.counter',
	name: 'counter',
	framework: '1.0',
	icon: false
});

function main(app){
	app.on('launch', function(){
		var window = new app.Window();
		
		window.width = 300;
		window.height = 300;
		window.title = 'counter';
			
		window.vars.number = 0;
			
		window.on('numberChanged', function(newNumber){
			window.vars.number = newNumber;
		});
			
		window.render(app.root + '/window', function(){
			
		});
	});
}