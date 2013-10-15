var configFile = __dirname + '/config.json';
__sysroot = __filename;
var fs = require('fs');
//rewrite require
if(!isCompiled){
	var origRequire = require;
	require = function(modName){
		var path = __sysroot + '/travler_modules/' + modName;
		if(fs.fileExistsSync(path)){
			return origRequire(path);
		} else {
			return origRequire(modName);
		}
	};
}

console.log('loading modules');
var express = require('express')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , startEvents = require('./logic/startEvents.js')
  , routes = require('./routes')
  , appManager = require('./logic/appManager.js')
  , windowManager = require('./logic/windowManager.js')
  , appRouter = require('./logic/appRouter.js')
  , launcherManager = require('./logic/launcherManager.js')
  , sandboxer = require('./logic/sandbox.js')
  , modDesktop = require('./logic/desktop.js')
  , user;
  
//global vars
global.autoLogin = true;

global.socketListners = [];
/*global.travlerTemp = {};
global.travlerTemp.desktop = {
	launcherPinned: {},
	applications: {}
}*/
	
startEvents.new('loadConfig', function(startCallback){
	fs.readFile(configFile, function(err, data){
		if(err){ throw err; }
		global.travlerConfig = JSON.parse(data);
		user = require('./logic/user.js');
		startCallback();
	});
});

setInterval(function(){
	fs.writeFile(configFile, JSON.stringify(global.travlerConfig, null, 4));
}, 5*1000);

var sessionStore = new connect.middleware.session.MemoryStore();
var app = express();
var server = http.createServer(app);


require('./logic/socketController.js').configure(server, sessionStore);

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('forms', __dirname + '/forms');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
//	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser('pofqui23py49823hf'));
    app.use(express.session({secret: 'pofqui23py49823hf', store: sessionStore}));
	app.use('/r', express.static(path.join(__dirname, 'public')));
	app.use(function(req, res, next){
		var cookie = req.signedCookies['travlerMachineID'];
		if(!cookie){
			cookie = makeID(20);
			res.cookie('travlerMachineID', cookie, {signed: true, path: '/', expires: new Date(Date.now() + 1000*60*60*24*365)});
		}
		req.machineID = cookie;
		req.user = new user(req.machineID);
		next();
	});
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});


app.all('/', routes.root);
app.all('/logout', routes.logout);
app.all('/test', routes.test);
appRouter.attach(app);

app.all('*', function(req, res){
	res.redirect('/');
});

startEvents.run(function(){
	server.listen(app.get('port'), function(){
		console.log("travler server listening on port " + app.get('port'));
	});
});


//functions
function makeID(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return 'a' + text; //always put a letter at the begining
}
