appConfig({
	id: 'com.jyelewis.centerTest',
	name: 'Center test',
	framework: '1.1b',
	icon: false
});

function main(app){
	app.on('launch', function(){
		var window = new app.Window();
		
		window.width = 300;
		window.height = 300;
		
		window.posTop = -1;
		window.posLeft = -1;
		
		window.title = 'in the middle';
		
		window.render(app.root + '/window');
	});
}