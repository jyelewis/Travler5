var page = useModule('page');
var sandbox = useModule('sandbox');
var startEvents = useModule('startEvents');
var async = require('async');
var userManager = useModule('userManager');
var fs = require('fs');

var pages = {};

//sets this to run BEFORE the server is started
startEvents.new('loadPages', function(eventCallback){
	async.auto({
		loginHtml: function(callback){
			loadResource('/html/login.html', callback);
		},
		loginCss: function(callback){
			loadResource('/css/login.css', callback);
		},
		loginJs: function(callback){
			loadResource('/js/login.js', callback);
		},
		desktopHtml: function(callback){
			loadResource('/html/desktop.html', callback);
		},
		desktopCss: function(callback){
			loadResource('/css/desktop.css', callback);
		},
		desktopJs: function(callback){
			loadResource('/js/desktop.js', callback);
		},
		loginRender: ['loginHtml', 'loginCss', 'loginJs', function(callback, results){
			sandbox.page.all('login', results.loginHtml, results.loginCss, results.loginJs, function(code){
				callback(null, code);
			});
		}],
		desktopRender: ['desktopHtml', 'desktopCss', 'desktopJs', function(callback, results){
			sandbox.page.all('desktop', results.desktopHtml, results.desktopCss, results.desktopJs, function(code){
				callback(null, code);
			});
		}]
	}, function(err, results){
		if(err){ throw err; }
		pages.login = results.loginRender;
		pages.desktop = results.desktopRender;
		eventCallback();
	});
});

exports.root = function(req, res){
	res.end('No user path entered');
};

exports.username = function(req, res){
	if(userManager.userExists(req.params.username)) {
		loadResource('/html/base.html', function(err, code){
			if(err){ throw err; }
			res.write(code);
			res.write(pages.login);
			res.write(pages.desktop);
			res.write('<script type="text/javascript">travler.rawSocket.emit("username", "' + req.params.username + '");</script>');
			res.end('</body></html>');
		});
	} else {
		res.end('invalid username');
	}
};

