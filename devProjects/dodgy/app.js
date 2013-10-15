//try a straight out logic error
//var test = 'a string';
//test();

exports.init = function(getApp){
//	test()
	getApp({ name: 'blah', icon: '' }, run);
};

function run(app){
	console.log('run ran');
	//doesntExist(); //now we are running, cause a logic Error
	//'test //random syntax error!
	setTimeout(function(){
		app.blah();
	}, 5000);
	app.on('launch', function(){
		var window = app.createWindow();
		window.UI.render();
	});
	setInterval(function(){
		console.log('test');
	}, 200);
}