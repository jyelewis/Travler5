$("#btnLaunch").click(function(){
	window.emit('launch', $("#drpApp").val());
});

$("#btnStop").click(function(){
	window.emit('stop');
});

$("#btnRestart").click(function(){
	window.emit('restart');
});

$("#btnClick").click(function(){
	window.emit('click');
});

$("#btnNew").click(function(){
	window.emit('newProject');
});

window.on('addProject', function(projectName){
	$("#drpApp").append('<option value="' + projectName + '">' + projectName + '</option>');
});

window.on('setState', setState);

function setState(state){
	if(state == 'select'){
		$("#divApps").slideDown(100);
		$("#btnLaunch").show().removeAttr('disabled');
		$("#btnStop").attr('disabled','disabled');
		$("#btnRestart").attr('disabled','disabled');
		$("#btnClick").hide();
	} else if(state == 'loading'){
		$("#divApps").slideUp(100);
		$("#btnLaunch").show().attr('disabled','disabled');
		$("#btnStop").attr('disabled','disabled');
		$("#btnRestart").attr('disabled','disabled');
		$("#btnClick").hide();
	} else if(state == 'running') {
		$("#divApps").slideUp(100);
		$("#btnLaunch").hide().attr('disabled','disabled');
		$("#btnStop").removeAttr('disabled');
		$("#btnRestart").removeAttr('disabled');
		$("#btnClick").show();
	}
}