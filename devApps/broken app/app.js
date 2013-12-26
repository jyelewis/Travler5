appConfig({
	id: 'com.jyelewis.brokentest',
	name: 'broken',
	framework: '1.1b',
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
			
		window.render(app.root + '/window');
		window.on('break', function(){
			asdf();
		});
	});
}