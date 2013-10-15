//for debugging server browser end
travler.socket.on('alert', function(a){ alert(a) });
travler.socket.on('console', function(a){ console.log(a) });

travler.socket.on('page.show', function(page){
	travler.page.show(page)
});

//so if the user logs in from another machine the current one is locked
travler.socket.on('login.kick', function(){
	location.reload(true);
});

/*//so the server can alter the launcher bar
travler.socket.on('desktop.launcher.alter', function(icon, task, pram){
	travler.LauncherIcon(icon)[task](pram);
});
travler.socket.on('desktop.launcher.clear', function(){
	travler.launcherClear();
});

//app list
travler.socket.on('desktop.appList', function(appList){
	travler.setupAppList(appList);
});

//server window tasks
travler.socket.on('desktop.window.create', function(windowID){
	new travler.Window(windowID);
});
travler.socket.on('desktop.window.UI', function(windowID, task, pram){
	travler.getWindow(windowID).UI[task](pram);
});
travler.socket.on('desktop.window.close', function(windowID){
	travler.getWindow(windowID).close();
});


//the router for the custom emitters
travler.socket.on('interfaceEmit', function(emit){
	var window = travler.windows[emit.id];
	delete(emit['arguments'][0]); //get rid of the event arg
	var args = [];
	for(prop in emit['arguments']){
		args.push(emit['arguments'][prop]);
	}
	if(emit.type == 'custom'){
		window._JQcustom.trigger(emit.event, args);
	} else {
		window._JQwindow.trigger(emit.event, args);
	}
});
*/

//so the server knows when page is loaded
jQuery(document).ready(function(){
	travler.socket.emit('document.load');
});