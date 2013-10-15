function isset(v) {
	if(typeof(v) === 'undefined'){
		return false;
	} else {
		return true;
	}
}

var travler = {};

travler.rawSocket = io.connect();

//to make the window refresh if the server restarts
travler.rawSocket.on('reconnect', function(){
	location.reload(true);
});

travler.error = function(errMessage) {
	console.log('Error: '+errMessage)
}

travler.selector = function(prefix, env){ //BUG: tag#id doenst seam to work (a#homeLink)
	return function(a){
		if(typeof a == 'string'){ // make sure the selector is a string, if not just pass it directly on
			var sel = String(a)
				.replace(/\#([^\s]+)/g, '#' + prefix + '__$1');
		} else {
			var sel = a;
		}
		return $(sel, env);
	}
};

travler.page = {
	pages: {},
	current: null,
	show: function(pageName){
		if(isset(travler.page.pages[pageName])){
			if(travler.page.current){
				travler.page.current.container.hide();
			}
			travler.page.pages[pageName].container.show();
			travler.page.current = travler.page.pages[pageName];
		} else {
			travler.error('Showing page: ' + pageName + ' - page doesn\'t exist');
		}
	},
	create: function(pageName) {
		if(isset(travler.page.pages[pageName])){ return false; }
		var obj = {
			title: pageName,
			container: $("#page_" + pageName),
			selector: travler.selector('page_' + pageName, '#page_' + pageName)
		}
		obj.container.addClass('page');
		travler.page.pages[pageName] = obj;
		return obj;
	},
	"delete": function(pageName) {
		if(!isset(travler.page.pages[pageName])){ return false; }
		pages[pageName].container.remove();
		pages[pageName] = null;
		return true;
	}
};

/* move to launcher Controller
travler.setupAppList = function(appList){
	var $ = travler.selector('page_desktop', '#page_desktop');
	var iconCode = '';
	jQuery.each(appList, function(){
		iconCode += '<div class="appIcon" data-id="' + this.id + '"> \
			<div class="appIconImage" style="background-image:url(\'/app/' + this.id + '/icon.svg\');"></div> \
			' + this.name + ' \
		</div>';
	});
	$("#appListIcon .appList").html(iconCode);
	$("#appListIcon .appList .appIcon").click(function(){
		travler.socket.emit('desktop.appList.click', $(this).attr('data-id'));
	});
};
*/
//socket interface code
travler.SocketInterface = function(socket, key){
	this._listners = {};
	this.key = key;
	this._socket = socket;
	var self = this;
	socket.on('INTERFACE.'+this.key, function(eventObj){
		if(typeof self._listners[eventObj.event] === 'undefined') return;

		for(var i=0; i<=self._listners[eventObj.event].length-1; i++){
			if(self._listners[eventObj.event][i]){
				(function(eventFunc){
					var funcCall = function(){ eventFunc.apply({}, eventObj.args); };
					if(typeof process !== 'undefined')
						process.nextTick(funcCall);
					else
						setTimeout(funcCall, 0);
				})(self._listners[eventObj.event][i].func);
				if(self._listners[eventObj.event][i].once){
					delete(self._listners[eventObj.event][i]);
				}
			}
		}
	});
}
travler.SocketInterface.prototype.on = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:false});
};
travler.SocketInterface.prototype.once = function(event, eventFunc){
	if(typeof this._listners[event] === 'undefined'){
		this._listners[event] = [];
	}
	this._listners[event].push({func: eventFunc, once:true});
};
travler.SocketInterface.prototype.emit = function(event){
	var args = [];
	for(var i=1; i<=arguments.length-1; i++){
		args.push(arguments[i]);
	}
	this._socket.emit('INTERFACE.'+this.key, {
		event: event,
		args: args,
	});
};
//end socket interface code