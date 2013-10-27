fw.Window = function(windowID, appID, windowGUI){
	this.appID = appID;
	this.id = windowID;
	this._windowGUI = windowGUI;	
	this._directSocket = new travler.SocketInterface(appSocket, 'window_'+windowID);
	this.socket = new travler.SocketInterface(this._directSocket, 'cliCode');
	this.GUIEvents = new EventEmitter();
	this.DOM = false;
	
	
	var self = this;
	
	//window as socket interface functions
	this.emit = function(){
		this.socket.emit.apply(this.socket, arguments);
	};
	this.on = function(){
		this.socket.on.apply(this.socket, arguments);
	};
	this.once = function(){
		this.socket.once.apply(this.socket, arguments);
	};
	
	
	this.GUIon = function(){
		this.GUIEvents.on.apply(this.GUIEvents, arguments);
	};
	
	//getters and setters for window GUI vars
	['width', 'height', 'posTop', 'posLeft', 'title'].forEach(function(property){
		self.__defineGetter__(property, function(){
			return self._windowPos[property];
		});
		//update gui prop from client
		self.__defineSetter__(property, function(value){
			self._windowGUI[property] = value;
			//trigger setting the new 'value' for 'property'
			if(property == "width" || property == "height")
				self._setWindowSize(self._windowGUI.width, self._windowGUI.height);
			else if(property == "posTop" || property == "posLeft")
				self._setWindowPos(self._windowGUI.posTop, self._windowGUI.posLeft);
			else if(property == "title"){
				self._setWindowTitle(self._windowGUI.title);
			}
			self._directSocket.emit('updateGUIvar', property, value);
		});
	});
	
	//updated gui property sent from server
	self._directSocket.on('updateGUIvar', function(property, value){
		self._windowGUI[property] = value;
		if(property == "width" || property == "height")
			self._setWindowSize(self._windowGUI.width, self._windowGUI.height);
		else if(property == "posTop" || property == "posLeft")
			self._setWindowPos(self._windowGUI.posTop, self._windowGUI.posLeft);
		else if(property == "title"){
			self._setWindowTitle(self._windowGUI.title);
		}
	});
	
	self._directSocket.on('close', function(){
		self.DOM.fadeOut(100);
		setTimeout(function(){
			self.DOM.remove();
		}, 100);
	});
	
	this._setupDOM();
};

fw.Window.prototype.focus = function(){
	this._focus();
};


//lower functions, should only be called by window prototype functions
fw.Window.prototype._setWindowPos = function(top, left){
	this.GUIEvents.emit('move', false);
	//set window position
	this.DOM.css('top', top);
	this.DOM.css('left', left);
};

fw.Window.prototype._setWindowSize = function(width, height){
	this.GUIEvents.emit('resize', false);
	//set window size
	this.DOM.css('width', width);
	this.DOM.css('height', height);
};

fw.Window.prototype._setWindowTitle = function(title){
	this.DOM.children('.handle').children('.title').text(title);
};

fw.Window.prototype._focus = function(){
	this.DOM.css('z-index', ++travler.highZindex);
	$(".windowContainer.focus").removeClass('focus'); //work out a way of informing this window of the blur
	this.DOM.addClass('focus');
};

//setup window dom
fw.Window.prototype._setupDOM = function(){
	var containerID = '#page_desktop__windowContainer';
	
	this.DOM = $(".window[data-windowID='"+ this.id +"']");
	this._focus();
	this.selector = travler.selector('window__' + this.id, this.DOM);
	var self = this;
	this.DOM
		.mousedown(function(){
			self.focus();
		})
		.draggable({
			containment: containerID,
			handle: '.handle',
			stop: function(evt, ui){
				self._windowGUI.posTop = self.DOM.css('top');
				self._windowGUI.posLeft = self.DOM.css('left');
				self.GUIEvents.emit('move', true);
				self._directSocket.emit('updateGUIvar', 'top', self._windowGUI.posTop);
				self._directSocket.emit('updateGUIvar', 'left', self._windowGUI.posLeft);
			}
		}).resizable({
			containment: containerID,
			stop: function(evt, ui){
				self._windowGUI.width = self.DOM.css('width');
				self._windowGUI.height = self.DOM.css('height');
				self.GUIEvents.emit('resize', true);
				self._directSocket.emit('updateGUIvar', 'width', self._windowGUI.width);
				self._directSocket.emit('updateGUIvar', 'height', self._windowGUI.height);
			},
			minWidth:300,
			minHeight:250
		})
		this.DOM.children('.handle').children('.windowButtons').children('.btnClose').click(function(){
			self._directSocket.emit('close');
			self.GUIEvents.emit('close');
		});
};







