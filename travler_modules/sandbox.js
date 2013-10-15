var sass = require('node-sass')
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');

var app = {
	css: {},
	html: {},
	js: {}
}

page = {}

app.css.raw = function(prefix, preCode, ids, callback){
	var code = String(preCode);
	loadResource('/css/keyframes.css', function(err, keyframes){
		if(err){ throw(err); }
		if(prefix){
			prefix = '#' + prefix;
			code =  code.replace(/\_this\_ {([\s\S]*?)}/g, '$1');
			code = prefix + ' { ' + code + ' }';
		}
		sass.render(code, function(err, css){
			if(err){ throw(err); }
			for(var oldId in ids){
				css = css.replace(new RegExp(' #' + oldId, 'g'), ' #' + ids[oldId]);
			}
			callback(keyframes + css);
		});
	});
}

app.css.file = function(prefix, file, ids, callback) {
	fs.readFile(__sysroot + file, function(err, data){
		if(err) { throw(err); }
		css.raw(prefix, data, ids, callback);
	});
}

app.html.raw = function(prefix, code, callback){
	var $ = cheerio.load(code);
	var ids = {};
	$("[id]").each(function(){
		var oldId = $(this).attr('id');
		var newId = prefix + '__' + oldId;
		$(this).attr('id', newId);
		ids[oldId] = newId;
	});
	var html = $.html();
	process.nextTick(function(){
		callback(html, ids);
	});
}

app.html.file = function(prefix, file, callback) {
	fs.readFile(__sysroot + file, function(err, data){
		if(err) { throw(err); }
		html.raw(prefix, data, callback);
	});
}

app.js.raw = function(prefix, code, recover, callback){
	var stateCode = '';
	isRecover = 'false';
	if(recover){ isRecover = 'true'; }
	stateCode += 'window.UI._JQ.trigger(\'load\');';
	stateCode += 'window.interfaceEmit(\'load\', ' + isRecover + ');';
	if(recover){
		stateCode += 'window.restore(' + JSON.stringify(recover) + ')';
	} else {
		stateCode += 'window.UI._JQ.trigger(\'ready\');';
	}
	code = '\
	(function(window){ \
		var $; \
		' + code + ' \
		\n \
		setTimeout(function(){ \
			$ = window.selector; \
			' + stateCode + ' \
		}, 0); \
	})(travler.getWindow(\'' + prefix +'\')); \n \
	';
	process.nextTick(function(){
		callback(code);
	});
}

app.js.file = function(prefix, file, callback) {
	fs.readFile(__sysroot + file, function(err, data){
		if(err) { throw(err); }
		js.raw(prefix, data, callback);
	});
}

/* prefix, htmlCode, cssCode, jsCode, */
app.all = function(UI, recover, callback){
	var prefix = UI.window.id;
	var htmlCode = UI.html;
	var cssCode = UI.css;
	var jsCode = UI.js;
	var title = UI._title;
	var appID = UI.window.app.id;
	var size = 'width:' + UI._width + 'px; height:' + UI._height + 'px;';
	var position = 'top:' + UI._top + 'px; left:' + UI._left + 'px;';
	var ordering = UI._ordering;
	async.auto({
		css: ['html', function(callback, results){
			app.css.raw(prefix + ' .windowContent', cssCode, results.html.ids, function(code){
				callback(null, code);
			});
		}],
		html: function(callback){
			var code = String(htmlCode).replace(/<\*appHandle\*>/g, '/app/' + appID + '/handle');
			code = String(code).replace(/<\*app\*>/g, '/app/' + appID);
			app.html.raw(prefix, code, function(code, ids){
				callback(null, {code:code, ids:ids });
			});
		},
		js: function(callback){
			app.js.raw(prefix, jsCode, recover, function(code){
				callback(null, code)
			});
		}
	}, function(err, results){
		var page = '';
		page += '<div id="' + prefix + '" class="window" data-window="' + prefix + '" data-app="' + prefix.substring(0,6) + '" \
			style="' + size + position + '" data-ordering="' + ordering + '">';
		page += '<style type="text/css">';
		page += results.css;
		page += '</style>';
		page += '<div class="handle"> \
					<div class="windowButtons"> \
						<div class="btnClose"> \
							<div class="btnInner"></div> \
						</div> \
					</div> \
				<span class="title">' + title + '</span></div>';
		page += '<div class="windowContent">';
		page += results.html.code;
		page += '</div>';
		page += '<script type="text/javascript">'; //js at bottom so everything is loaded
		page += results.js;
		page += '</script>';
		page += '</div>';
		process.nextTick(function(){
			callback(page);
		});
	});
}

page.css = app.css.raw;
page.html = app.html.raw; //they do the same so might as well share code here
page.js  = function(prefix, code, callback){
	code = '\
	(function(page){ \
		var $ = page.selector; \
		' + code + ' \
	})(travler.page.create(\'' + prefix +'\'))';
	process.nextTick(function(){
		callback(code);
	});
}
page.all = function(prefix, htmlCode, cssCode, jsCode, callback){
	async.auto({
		css: ['html', function(callback, results){
			page.css('page_' + prefix, cssCode, results.html.ids, function(code){
				callback(null, code);
			});
		}],
		html: function(callback){
			page.html('page_' + prefix, htmlCode, function(code, ids){
				callback(null, {code:code, ids:ids });
			});
		},
		js: function(callback){
			page.js(prefix, jsCode, function(code){
				callback(null, code)
			});
		}
	}, function(err, results){
		var page = '';
		page += '<div id="page_' + prefix + '">';
		page += '<style type="text/css">';
		page += results.css;
		page += '</style>';
		page += '<script type="text/javascript">';
		page += results.js;
		page += '</script>';
		page += results.html.code;
		page += '</div>';
		process.nextTick(function(){
			callback(page);
		});
	});
}




exports.app = app;
exports.page = page;