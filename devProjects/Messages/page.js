window.UI.on('load', function(){
	$("#name").blur(function(){
		window.emit('setName', $("#name").val());
	});
	$("#sendButton").click(function(){
		window.emit('sendMessage', $("#sendTextbox").val());
		$("#sendTextbox").val('');
	});
	window.on('showMessage', function(message){
		showMessage(message);
	});
	$("#newWindow").click(function(){
		window.emit('newWindow');
	});
});

window.UI.on('recover', function(evt, recov){
	jQuery.each(recov.messages, function(){
		showMessage(this);
	});
});

var showMessage = function(message){
	$("#messages").append('<div class="message">' + message + '</div>');
};