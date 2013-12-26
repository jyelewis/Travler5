var appSocket = new travler.AppSocket(windowData.appID);
var windowObj = new fw.Window(windowData.id, windowData.appID, windowData.pos);
windowObj._directSocket.emit('connect');


(function(window){
	var appSocket, windowObj; //cover vars
	
	var $ = window.selector;
	eval(windowData.code);
})(windowObj);