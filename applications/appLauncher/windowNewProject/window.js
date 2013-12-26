$("#btnCreate").click(function(){
	window.emit('createApplication', {
		framework: $("#drpFramework").val(),
		name: $("#tbxProjectName").val()
	});
	$("#btnCreate")
		.attr('disabled', 'disabled')
		.text('Creating project...');
	$("#drpFramework").attr('disabled', 'disabled');
	$("#tbxProjectName").attr('disabled', 'disabled');
});