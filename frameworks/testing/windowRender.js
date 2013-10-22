var fs = require('fs');

var sass = require('node-sass');
var cheerio = require('cheerio');
var ejs = require('ejs');

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


compileHtmlCss('alkvjn23d', {name: 'Jye'}, fs.readFileSync('test.ejs').toString(), fs.readFileSync('test.scss').toString(), function(code){
	fs.writeFileSync('test.html', code);
});