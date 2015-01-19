appConfig({
	id: 'com.jyelewis.textarea',
	name: 'Textarea',
	framework: '1.2b',
	icon: false
});

function main(app){
	app.on('launch', function(){
		var window = new app.Window();
		
		window.width = 500;
		window.height = 500;
		window.title = 'Textarea';
		
		app.data.load('text', function(err, data){
			window.vars.text = data ? data : "";
			window.render(app.root + '/window');
		});
		
		
		window.onRecover = function(cb){
			app.data.load('text', function(err, data){
				window.vars.text = data ? data : "";
				cb();
			});
		};
		
		window.on('saveData', function(text){
			console.log(text);
			app.data.save('text', text);
		});
		
		window.onClose = function(cb){
			window.once('saveData', function(){
				cb(true);
			});
			
			window.emit('requestSave');
		};
	});
}