var appSocket = new travler.AppSocket(windowData.appID);
var windowobj = new fw.Window(windowData.id, windowData.appID, windowData.pos);

windowobj.width = 300;
windowobj.height = 250;
windowobj.posTop = 50;

windowobj.title = 'test';

/*windowobj.GUIon('move', function(wasC){
	if(wasC)
		windowobj.posTop = 50;
});*/