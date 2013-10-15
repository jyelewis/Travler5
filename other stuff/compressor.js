var fs = require('fs');

var uglify = require('uglify-js');

var out = uglify.minify('compresMe.js', {
	compress: {
		dead_code:true,
		unused:true,
		unsafe:true,
		hoist_vars:true,
		hoist_funs:true
	}
});

console.log(out);