var userManager = useModule('userManager');
var Desktop = useModule('desktop');
var SocketInterface = useModule('socketInterface');

var autoLogin = false;

exports.setup = function(username, rawSocket){
	//check logged in cookie and stuff here first
	var socket = new SocketInterface(rawSocket, 'desktop');
	
	if(!autoLogin)
		socket.emit('showPage', 'login');
	
	userManager.prep(username, function(){
		socket.emit('login.unlock');
	});
	socket.on('login.check', function(password){
		if(userManager.checkPassword(username, password)){
			//load desktop
			var user = new userManager.User(username, password);
			user.login(function(){
				user.setSocket(rawSocket);
				var desktop = new Desktop(user);
				desktop.setup();
			});
			
		} else {
			setTimeout(function(){ //prevent brute force
				socket.emit('login.fail');
			}, 500);
		}
	});
	
	//auto login
	if(autoLogin){
		var user = new userManager.User('jyelewis', ' ');
		user.login(function(){
			user.setSocket(rawSocket);
			var desktop = new Desktop(user);
			desktop.setup();
			socket.emit('showPage', 'desktop')
		});
	}
};