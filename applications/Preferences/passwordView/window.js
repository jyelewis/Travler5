$("#btnSubmit").click(function(){
	var p1 = $("#pwdNew").val();
	var p2 = $("#pwdRepeat").val();
	var hasError = false;
	if(p1 != p2){
		$("#divMessage").text('Passwords do not match').addClass('err');
		hasError = true;
	} else if(p1 == ''){
		$("#divMessage").text('Password cannot be blank').addClass('err');
		hasError = true;
	}
	
	if(!hasError){
		//update the password
		window.emit('setPassword', p1);
	}
});