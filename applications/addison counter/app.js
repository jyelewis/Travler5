
app.on('launch', function(){
	var window = new app.Window();
	
	window.width = 300;
	window.height = 300;
	window.title = 'counter';
		
	window.vars.number = 0;
		
	window.on('numberChanged', function(newNumber){
		window.vars.number = newNumber;
		
		app.prompt("Hello", "what is your name", ['Addision', 'Jye'], function(btn){
			app.prompt("hi", btn);
		});
		
	});
		
	window.render('window');
});