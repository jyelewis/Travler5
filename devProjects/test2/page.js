var counterDiv;
var counter = 0;

window.UI.on('load', function(){ //should run every time
	counterDiv = $("#counterDiv");
	window.on('socketTest', function(newCount){ //all bindings have to be under load
		counter = newCount;
		counterDiv.text(counter);
	});
	$("#clickMe").click(function(){
		window.emit('socketTest', counter);
		console.log('clicked');
	});
	console.log('load');
});

window.UI.on('ready', function(){ //should run only the first time the window is opened
	console.log('ready');
});

window.UI.on('recover', function(a, recov){ //should run only on recovery
	counterDiv.text(recov.counter);
	//$("#textbox").val(recov.textbox);
});

window.UI.freeze = function(){
	//return { textbox: $("#textbox").val() };
	return {};
};