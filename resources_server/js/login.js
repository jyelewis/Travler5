$(document).ready(function(){
	$("#passwordInput").focus();
	$("#passwordContainer form").submit(function(e){
		e.preventDefault();
		travler.desktopSocket.emit('login.check', $("#passwordInput").val());
		$("#loginSpinner").show(); //show the spinner
		$("#passwordInput").blur();
		travler.desktopSocket.on('login.fail', function(){
			setTimeout(function(){
				$("#loginSpinner").hide();
				$("#passwordInput").addClass('fail').val('').focus();
			}, 2000);
		});
	});
	$("#passwordContainer form input").keydown(function(){
		$(this).removeClass('fail')
	});
	travler.desktopSocket.on('login.load', function(){
		
	});
	travler.desktopSocket.on('login.unlock', function(){
		$("#passwordInput").removeAttr('disabled').focus();
		$("#loginSpinner").hide();
	});
});