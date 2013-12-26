(function($){

	var desktopSocket = new travler.SocketInterface(travler.rawSocket, 'desktop');
	travler.desktopSocket = desktopSocket;

	desktopSocket.on('showPage', travler.page.show);
	desktopSocket.on('reload', function(){ location.reload(true); });

	//for adding windows
	desktopSocket.on('newWindow', function(code){
		$("#windowContainer").prepend(code);
	});
	
	desktopSocket.on('setBackgroundImage', function(imageURI){
		jQuery("#page_desktop").css('background-image', 'url('+imageURI+')');
		console.log(imageURI);
	});
	
	
	desktopSocket.on('screenSize', sendScreenSize);
	
	$(document).ready(function(){
		var resizeTimer;
		jQuery(window).resize(function() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(sendScreenSize, 300);
		});
		
		$("#logoutButton").click(function(){
			desktopSocket.emit('logout');
		});
		$("#lockButton").click(function(){
			location.reload(true);
		});
		$("#appListIcon").mouseover(function(){
			$(this).addClass('open');
			$("#windowContainer").click(function(){
				$("#appListIcon").removeClass('open');
				$(this).off('click');
			});
		}).mouseout(function(){
			$(this).removeClass('open');
		});
	});


	function sendScreenSize(){
		desktopSocket.emit('screenSize', {width:$("#windowContainer").width(), height:$("#windowContainer").height()});
	}
})(travler.selector('page_desktop', '#page_desktop'));