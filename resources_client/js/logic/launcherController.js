(function($){

	var launcherSocket = new travler.SocketInterface(travler.rawSocket, 'launcher');
	//var obj = $("#launcher .launcherApp[data-app=" + this.appID + "]");
	
	launcherSocket.on('add', function(appID, title){
		var code = '<div class="launcherApp" data-app="' + appID + '"> \
				<div class="icon"> \
					<div class="iconInner" style="background-image:url(\'/app/' + appID + '/icon.png\');" ></div> \
				</div> \
				<div class="titleContainer"> \
					<div class="titleText"> \
						' + title + ' \
					</div> \
				<div class="clear"></div> \
			</div>';
			
		$("#launcher #launcherScroll").append(code);
		var obj = $("#launcher .launcherApp[data-app='" + appID + "']");
		
		obj.addClass('slideIn').addClass('running');
		setTimeout(function(){
			obj.removeClass('slideIn');
		}, 400);
		
		obj.click(function(){
			launcherSocket.emit('click', $(this).attr('data-app'));
		});
	});
	
	launcherSocket.on('remove', function(appID){
		var obj = $("#launcher .launcherApp[data-app='" + appID + "']");
		obj.addClass('slideOut');
		setTimeout(function(){
			obj.remove();
		}, 400);
	});
	
	launcherSocket.on('isRunning', function(appID, isRunning){
		var obj = $("#launcher .launcherApp[data-app='" + appID + "']");
		if(isRunning)
			obj.addClass('running');
		else
			obj.removeClass('running');
	});
	
	launcherSocket.on('shake', function(appID, start){
		var obj = $("#launcher .launcherApp[data-app='" + appID + "']");
		if(start){
			obj.addClass('shake');
		} else {
			obj.removeClass('shake');
		}
	});

})(travler.selector('page_desktop', '#page_desktop')); //because the launcher is within the desktop sandbox