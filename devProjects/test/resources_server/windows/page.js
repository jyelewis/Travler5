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
	window.on('resourceTest', function(text){
		$('#resourceText').text(text);
	});
    window.on('message', function(m){
        //$('#serverText').text('SERVER MESSAGE: ' + m);
    });
    window.UI.DOM.on('dragstart', function(){
        $('#serverText').text('CLIENT MESSAGE: drag start');
    });
    window.UI.DOM.on('dragstop', function(){
        $('#serverText').text('CLIENT MESSAGE: drag stop');
    });
    window.UI.DOM.on('resizestart', function(){
        $('#serverText').text('CLIENT MESSAGE: resize start');
    });
    window.UI.DOM.on('resizestop', function(){
        $('#serverText').text('CLIENT MESSAGE: resize stop');
    });
    window.UI.on('blur', function(){
        $('#serverText').text('CLIENT MESSAGE: blur');
    });
    window.UI.on('focus', function(){
        $('#serverText').text('CLIENT MESSAGE: focus');
    });
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