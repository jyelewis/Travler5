var fs = require('fs');
var async = require('async');
var sass = require('node-sass');
var cheerio = require('cheerio');
var ejs = require('ejs');

function loadWindowFiles(filePath, callback){
	var asyncFuncs = [];
	var scripts = {};
	var modules = {};
	['ejs', 'scss', 'js'].forEach(function(scriptType){
		asyncFuncs.push(function(cb){
			fs.readFile(filePath + '/window.' + scriptType, function(err, data){
				if(err) throw err;
				scripts[scriptType] = data.toString();
				cb();
			});
		});
	});
	
	asyncFuncs.push(function(cb){
		fs.readdir(filePath + '/window_modules/', function(err, files){
			var asyncFiles = [];
			files.forEach(function(file){
				asyncFiles.push(function(cb1){
					fs.readFile(filePath + '/window_modules/' + file, function(err, data){
						if(err) throw err;
						modules[file] = data.toString();
						cb1();
					}); //end fs.readFile
				}); //end asyncFiles.push
			}); //end files.forEach
			async.parallel(asyncFiles, cb);
		}); //end fs.readdir
	}); //end asyncFuncs.push
	
	async.parallel(asyncFuncs, function(){
		 //here scripts and modules are populated
		 callback({scripts: scripts, modules: modules});
	});
}

function compileHtmlCss(windowID, windowVars, ejsHtml, scss, callback){
	var prefix = 'window__' + windowID;
	
	//ejs
	var html = ejs.render(ejsHtml, windowVars);
	
	//html
	var $ = cheerio.load(html);
	var ids = {};
	$("[id]").each(function(){
		var oldId = $(this).attr('id');
		var newId = prefix + '__' + oldId;
		$(this).attr('id', newId);
		ids[oldId] = newId;
	});
	html = $.html();
	
	//css
	scss = '#'+prefix + ' { ' + scss + ' }';
	sass.render(scss, function(err, css){
		if(err) throw err;
		for(var oldId in ids){
			css = css.replace(new RegExp('#' + oldId, 'g'), '#' + ids[oldId]);
		}
		
		//put them together
		var result = '<style type="text/css">' + css + '</style>' + html;
		callback(result);
	});
}

function loadFramework(windowData, callback){
	var windowDataJSON = JSON.stringify(windowData).toString();
	var code = '(function(){ ';
	code += "var windowData = " + windowDataJSON + "; \n";
	code += "var fw = {}; \n";

	async.parallel([
		function(cb){
			loadResource('/localCode/windowObj.js', cb);
		},
		function(cb){
			loadResource('/localCode/framework.js', cb);
		},
	], function(err, results){
		if(err) throw err;
		results.forEach(function(codeFile){
			code += codeFile.toString();
		});
		code += '})();'; //end function closure
		callback(code);
	});
}

function compileCode(mainScript, modules){
	return mainScript;
}

function renderWindow(windowPath, window, callback){
	loadWindowFiles(windowPath, function(files){
		var windowData = {
			id: window.id,
			appID: __appConfig.id,
			appPID:process.pid,
			code: compileCode(files.scripts.js, files.modules),
			pos: window._windowGUI
		};
		loadResource('/localCode/'+window._template, function(err, templateCode){
			if(err) console.log(err);
			loadResource('/localCode/style.scss', function(err, templateStyle){
				if(err) console.log(err);
				loadFramework(windowData, function(javascriptCode){
					var cssCode = templateStyle + ' .windowContent { ' + files.scripts.scss + ' }';
					compileHtmlCss(window.id, window.vars, files.scripts.ejs, cssCode, function(GUIcode){
						var windowCode = ejs.render(templateCode.toString(), {
							windowID:window.id,
							GUIcontent:GUIcode,
							javascript:javascriptCode
						});//ejs.render
						callback(windowCode);
					});//compileHtmlCss
				});//load framework
			});//loadResource
		});//loadResource
	});//loadwindow files
}


exports.renderWindow = renderWindow;











