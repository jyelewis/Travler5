(function($){

	var desktopSocket = new travler.SocketInterface(travler.rawSocket, 'desktop');
	travler.desktopSocket = desktopSocket;

	desktopSocket.on('showPage', travler.page.show);
	desktopSocket.on('reload', function(){ location.reload(true); });

	//for adding windows
	desktopSocket.on('newWindow', function(code){
		$("#windowContainer").prepend(code);
	});
	
	
	$(document).ready(function(){
		$("#logoutButton").click(function(){
			desktopSocket.emit('logout');
		});
		$("#lockButton").click(function(){
			location.reload(true);
		});
	});

})(travler.selector('page_desktop', '#page_desktop'));