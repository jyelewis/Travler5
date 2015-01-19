var saveTimeout = 0;
$("textarea").keyup(function(){
	clearTimeout(saveTimeout);
	var self = this;
	saveTimeout = setTimeout(function(){
		window.emit('saveData', $(self).val());
	}, 2000);
});


function saveData(){
	window.emit('saveData', $("textarea").val());
}


window.on('requestSave', saveData);