(function(){

var desktopSocket = new travler.SocketInterface(travler.rawSocket, 'desktop');
travler.desktopSocket = desktopSocket;

desktopSocket.on('showPage', travler.page.show);
desktopSocket.on('reload', function(){ location.reload(true); });


})();