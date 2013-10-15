(function($){
	travler.launcherClear = function(){
		$("#launcherScroll").html('');
	};
	
	travler.LauncherIcon = function(appID){
		if(false === (this instanceof travler.LauncherIcon)) {
			return new travler.LauncherIcon(appID);
		}
		this.appID = appID;
		this.obj = $("#launcher .launcherApp[data-app=" + this.appID + "]");
		this.exists = true;
		if(this.obj.length == 0){
			this.obj = false;
			this.exists = false;
		}
	};

	travler.LauncherIcon.prototype = {
		shake: function(start){
			if(start){
				this.obj.addClass('shake');
			} else {
				this.obj.removeClass('shake');
			}
		},
		create: function(title){
			if(this.exists){
				return false;
			}
			var code = '<div class="launcherApp" data-app="' + this.appID + '"> \
				<div class="icon"> \
					<div class="iconInner" style="background-image:url(\'/app/' + this.appID + '/icon.svg\');" ></div> \
				</div> \
				<div class="titleContainer"> \
					<div class="titleText"> \
						' + title + ' \
					</div> \
				<div class="clear"></div> \
			</div>';
			
			$("#launcher #launcherScroll").append(code);
			this.obj = $("#launcher .launcherApp[data-app=" + this.appID + "]");
			this.obj.addClass('slideIn');
			var self = this;
			setTimeout(function(){
				self.obj.removeClass('slideIn');
			}, 400);
			this.exists = true;
			this.obj.click(function(){
				travler.socket.emit('desktop.launcher.click', $(this).attr('data-app'));
				if($(this).hasClass('running')){
					$("#windowContainer [data-app=" + $(this).attr('data-app') + "]").each(function(){
						travler.focusWindow(travler.getWindow($(this).attr('data-window')));
					});
				}
			});
		},
		remove: function(){
			this.obj.addClass('slideOut');
			var self = this;
			setTimeout(function(){
				self.obj.remove();
				self.exists = false;
				self.obj = false;
			}, 400);
		},
		title: function(newTitle){
			if(!this.exists){
				return false;
			}
			var retVal = this.obj.children(".titleContainer").children(".titleText").text().trim();
			if(newTitle){
				this.obj.children(".titleContainer").children(".titleText").text(newTitle);
				this.obj.children(".icon").children("img").attr('alt', newTitle);
			}
			return retVal;
		},
		running: function(newVal){
			if(!this.exists){
				return false;
			}
			var retVal = this.obj.hasClass('running');
			if(typeof newVal !== 'undefined'){
				if(newVal){
					this.obj.addClass('running');
				} else {
					this.obj.removeClass('running');
				}
			}
		}
	};
})(travler.selector('page_desktop', '#page_desktop')); //because the launcher is within the desktop sandbox
