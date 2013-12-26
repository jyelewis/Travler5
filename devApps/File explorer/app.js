appConfig({
	id: 'com.jyelewis.fileExplorer',
	name: 'Travler5 File explorer',
	framework: '1.1b',
	icon: "icon.png"
});

function main(app){
	app.on('launch', function(){
		app.useModule('userData').getUserData(__username, function(data){
			var explorerWindow = app.useModule('explorerWindow');
			explorerWindow.showDir(data.homeDir); //default to home dir
		});
		
	});
}