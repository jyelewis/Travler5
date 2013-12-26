$(".user").click(function(e){
	var username = $(e.target).text().trim();
	window.emit('usernameClick', username);
});

/*$("#tbxPortNum").change(function(){
	window.emit('changePort', $("#tbxPortNum").val());
});*/