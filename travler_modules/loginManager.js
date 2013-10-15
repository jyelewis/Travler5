var userManager = useModule('userManager');
var Desktop = useModule('desktop');
var SocketInterface = useModule('socketInterface');

exports.setup = function(username, rawSocket){
	//check logged in cookie and stuff here first
	var socket = new SocketInterface(rawSocket, 'desktop');
	
	socket.emit('showPage', 'login');
	userManager.prep(username, function(){
		socket.emit('login.unlock');
	});
	socket.on('login.check', function(password){
		if(userManager.checkPassword(username, password)){
			//load desktop
			var user = new userManager.User(username, password);
			user.setSocket(rawSocket);
			var desktop = new Desktop(user);
			desktop.setup();
		} else {
			setTimeout(function(){ //prevent brute force
				socket.emit('login.fail');
			}, 500);
		}
	});
};