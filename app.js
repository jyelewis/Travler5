__sysroot = __dirname;
var fs = require('fs');

//global functions
useModule = function(modName){
	var path = __sysroot + '/travler_modules/' + modName + '.js';
	if(fs.existsSync(path)){
		return require(path);
	}
};
loadResource = function(path, callback){
	var file = fs.readFileSync(__sysroot + '/resources_server/' + path);
	if(typeof callback == 'function'){
		callback(null, file);
	} else {
		return file;
	}
}
loadClientResource = function(path, callback){
	var file = fs.readFileSync(__sysroot + '/resources_client/' + path);
	if(typeof callback == 'function'){
		callback(null, file);
	} else {
		return file;
	}
}


var configFile = __sysroot + '/config.json';

var express = require('express')
  , http = require('http')
  , path = require('path')
  , connect = require('connect')
  , startEvents = useModule('startEvents')
  , routes = useModule('routes')
  , appManager = useModule('appManager')
  , windowManager = useModule('windowManager')
  , appRouter = useModule('appRouter')
  , launcherManager = useModule('launcherManager')
  , sandboxer = useModule('sandbox')
  , modDesktop = useModule('desktop')
  , user;
  
require('domain'); //domains only activate if they have been required
  
  
startEvents.new('loadConfig', function(startCallback){
	fs.readFile(configFile, function(err, data){
		if(err){ throw err; }
		travlerConfig = JSON.parse(data);
		user = useModule('user');
		startCallback();
	});
});

setInterval(function(){
	//fs.writeFile(configFile, JSON.stringify(travlerConfig, null, 4));
}, 5*1000);

var sessionStore = new connect.middleware.session.MemoryStore();
var app = express();
var server = http.createServer(app);


useModule('socketController').configure(server, sessionStore);

app.configure(function(){
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.cookieParser('pofqui23py49823hf'));
    app.use(express.session({secret: 'pofqui23py49823hf', store: sessionStore}));
	app.use('/r', function(req, res, next){
		var path = req.url.toString().split('?')[0];
		var pathParts = path.split('.');
		var extention = pathParts[pathParts.length-1];
		if(extention == 'svg')
			res.setHeader("Content-Type", "image/svg+xml");
		if(extention == 'js')
			res.setHeader("Content-type", "application/javascript");
		if(extention == 'css')
			res.setHeader("Content-type", "text/css");
		if(extention == 'png')
			res.setHeader("Content-type", "image/png");
		if(extention == 'jpg')
			res.setHeader("Content-type", "image/jpeg");
		res.end(loadClientResource(path)); //get everything before the ?
	});
	app.use(function(req, res, next){
		var cookie = req.signedCookies['travlerMachineID'];
		if(!cookie){
			cookie = makeID(20);
			res.cookie('travlerMachineID', cookie, {signed: true, path: '/', expires: new Date(Date.now() + 1000*60*60*24*365)});
		}
		req.machineID = cookie;
		next();
	});
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});


app.all('/', routes.root);
appRouter.attach(app);
app.all('/:username', routes.username);

app.all('*', function(req, res){
	res.redirect('/');
});

startEvents.run(function(){
	server.listen(travlerConfig.port, function(){
		console.log("Travler server listening on port " + travlerConfig.port);
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

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
