var sandbox = require('./logic/sandbox.js');

var html = '<div id="test"><span class="text">Hello world</span></div>';

var css = '';
css += '_this_ { width:500px; height:500px; background-color:red; }';
css += '#test { width:200px; height:200px; background-color:green; margin:50px; }';
css += '.text { font-size:21px; }';

var js = 'alert(\'test\');';

sandbox.page.raw('someapp', html, css, js, function(code){
	console.log(code);
});