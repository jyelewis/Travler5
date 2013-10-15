var testResources = useModule('testResources');
function createWindow(app, order){
	var window = app.createWindow();
	/*window.UI.title('my first window');
	window.UI.width(250);
	window.UI.height(200);
	window.UI.top(100);
	window.UI.left(20);*/
	window.UI.title('test window ' + order);
	window.UI.top(order*20+10);
	window.UI.left(order*20+10);
	
	window.UI.html = loadResource('/windows/page.html');
	window.UI.css  = loadResource('/windows/page.css');
	window.UI.js   = loadResource('/windows/page.js');
	window.UI.render();
		
	var counter = 1;
	window.UI.on('ready', function(){
		window.on('socketTest', function(){
			counter++;
			if(counter == 5){
				window.shake(500);
			}
			if(counter >= 10){
				window.close();
				return;
			}
			window.emit('socketTest', counter);
		});
		window.emit('socketTest', counter);
	});
	window.UI.recover = function(){
		return({
			counter: counter
		});
	};
	window.UI.on('freeze', function(freezeData){
		
	});
	window.UI.on('load', function(){ //when the window is ready at anytime
		testResources(window);
	});
	window.UI.close = function(){
		//createWindow(app, windowOrder++);
		window.close();
	};
    
    window.UI.on('focus', function(){
        window.emit('message', 'focus caught');
    });
    window.UI.on('blur', function(){
        window.emit('message', 'blur caught');
    });
    window.UI.on('resize', function(){
        window.emit('message', 'resize caught');
    });
    window.UI.on('move', function(){
        window.emit('message', 'move caught');
    });
}

module.exports = createWindow;