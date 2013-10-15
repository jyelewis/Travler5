travler.windows = {};

travler.getWindow = function(windowID){
	if(typeof travler.windows[windowID] === 'undefined'){
		return false;
	}
	return travler.windows[windowID];
};

travler.Window = function(windowID){
	this.id = windowID;
	this._JQcustom = jQuery(this);
	this._JQwindow = jQuery(this);
	this.UI = new travler.WindowUI(this);
	this.selector = false;
	travler.windows[this.id] = this;
	var self = this;
	setInterval(function(){ //auto save the state every one and a half seconds
		self.freeze();
	}, 5000);
	this.interfaceOn('setTitle', function(title){
		self.UI.DOM.children('.handle').children('.title').text(title);
	});
	this.interfaceOn('setTop', function(top){
		self.UI.DOM.css('top', top);
	});
	this.interfaceOn('setLeft', function(left){
		self.UI.DOM.css('left', left);
	});
	this.interfaceOn('setHeight', function(height){
		self.UI.DOM.css('height', height);
	});
	this.interfaceOn('setWidth', function(width){
		self.UI.DOM.css('width', width);
	});
}

travler.Window.prototype = { // socket prototype functions
	interfaceEmit: function(evt, data){
		travler.socket.emit('interfaceEmit', { type: 'window', id: this.id, event: evt, 'arguments': arguments });
	},
	interfaceOn: function(evt, handler) {
    	this._JQwindow.bind(evt, function(){
    		var args = [];
			delete(arguments[0]);
			for(prop in arguments){
				args.push(arguments[prop]);
			}
    		handler.apply(null, args);
    	});
    },
	emit: function(evt, data){
		travler.socket.emit('interfaceEmit', { type: 'custom', id: this.id, event: evt, 'arguments': arguments });
	},
	on: function(evt, handler) {
    	this._JQcustom.bind(evt, function(){
    		var args = [];
			delete(arguments[0]);
			for(prop in arguments){
				args.push(arguments[prop]);
			}
    		handler.apply(null, args);
    	});
    }
};

travler.Window.prototype.freeze = function(){
	var freezeData;
	var freezeState = [];
	if(typeof this.UI.freeze == 'function'){ //run custom freeze function
		freezeData = this.UI.freeze();
	}
	//get form values and save
	this.UI.DOM.find("input").each(function(){
		var elm = $(this);
		var type = elm.attr('type');
		if(type == 'text'){
			freezeState.push({
				id: elm.attr('id'),
				method: 'val',
				value: elm.val()
			});
		}
	});
	this.UI.DOM.find("textarea").each(function(){
		var elm = $(this);
		freezeState.push({
			id: elm.attr('id'),
			method: 'val',
			value: elm.val()
		});
	});
	this.interfaceEmit('freeze', { custom: freezeData, state: freezeState });
};
travler.Window.prototype.restore = function(restoreData){
	this.UI._JQ.trigger('recover', restoreData.custom);
	var self = this;
	jQuery.each(restoreData.state, function(elm){
		var elm = this;
		self.UI.DOM.find("#"+elm.id)[elm.method](elm.value);
	});
};

travler.Window.prototype.close = function(){
	delete(travler.windows[this.id]);
	if(!this.UI.rendered){ return; }
	this.UI.DOM.remove();
};

travler.WindowUI = function(window){
	this.window = window;
	this.rendered = false;
	this._JQ = jQuery(this);
	//for emitting here this._JQ.trigger(evt, data);
	this.DOM = false;
};

travler.WindowUI.prototype.on = function(evt, handler) {
    this._JQ.bind(evt, handler);
};

(function($){ //the render function needs a closure for some private vars
	var highestWindow = 1;
	var containerID = '#page_desktop__windowContainer';
	travler.WindowUI.prototype.render = function(code){
		$("#windowContainer").prepend(code);
		this.DOM = $("#windowContainer .window[data-window=" + this.window.id + "]");
		var ordering = this.DOM.attr('data-ordering');
		this.DOM.css('z-index', ordering);
		if(ordering > highestWindow){
			highestWindow = ordering;
			$("#windowContainer .focus").removeClass('focus');
			this.DOM.addClass('focus');
		}
		this.window.selector = travler.selector(this.window.id, this.DOM);
		var self = this;
		this.DOM
			.mousedown(function(){
				travler.focusWindow(self.window);
			})
			.draggable({
				containment: containerID,
				handle: '.handle',
				stop: function(evt, ui){
					self.window.interfaceEmit('move', ui.position);
				}
			}).resizable({
				containment: containerID,
				stop: function(evt, ui){
					self.window.interfaceEmit('resize', ui.size);
				},
				minWidth:300,
				minHeight:250
			})
			this.DOM.children('.handle').children('.windowButtons').children('.btnClose').click(function(){
				self.window.interfaceEmit('closeClick');
			});
		travler.focusWindow(this.window); //so it becomes the top, focused window on load
		this.rendered = true;
	};
	travler.focusWindow = function(window){ //setup js side for the window
		var elm = window.UI.DOM;
		if($(elm).hasClass('focus')){ return; }
		var toBlur = $("#windowContainer .focus");
		if(toBlur.length > 0){
			toBlur.removeClass('focus');
			var blurWindow = travler.getWindow(toBlur.attr('data-window'));
			blurWindow.interfaceEmit('blur', toBlur.attr('data-ordering'))
			blurWindow.UI._JQ.trigger('blur');
		}
		$(elm)
			.css('z-index', ++highestWindow)
			.attr('data-ordering', highestWindow)
			.addClass('focus');
		
		window.interfaceEmit('focus', $(elm).attr('data-ordering'));
		window.UI._JQ.trigger('focus');
	}
})(travler.selector('page_desktop', '#page_desktop'));

