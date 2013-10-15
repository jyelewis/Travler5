(function($){

	var desktopSocket = new travler.SocketInterface(travler.rawSocket, 'desktop');
	travler.desktopSocket = desktopSocket;

	desktopSocket.on('showPage', travler.page.show);
	desktopSocket.on('reload', function(){ location.reload(true); });

	//for adding windows
	desktopSocket.on('newWindow', function(code){
		$("#windowContainer").prepend(code);
	});


})(travler.selector('page_desktop', '#page_desktop'));