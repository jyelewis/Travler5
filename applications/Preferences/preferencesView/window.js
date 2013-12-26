$("#btnChangePass").click(function(){
	window.emit('changePassword');
});


var changes = {};
$("[data-type]").change(function(e){
	var inputType = $(e.target).attr('data-type');
	changes[inputType] = $(e.target).val();
});

$("#cbxAdmin").change(function(){
	changes.isAdmin = $("#cbxAdmin").is(":checked");
});

$("#btnSubmit").click(function(){
	window.emit('save', changes);
});