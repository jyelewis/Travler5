exports.render = render;

function render(req, res, page, vars) {
	if(typeof(vars.pageTitle) !== 'undefined'){
		vars.pageTitle = vars.pageTitle + ' - travler';
	} else {
		vars.pageTitle = 'travler';
	}
	
	if(typeof vars.layout === 'undefined'){
		if(req.query.isAjax === '1') {
			vars.layout = 'ajax';
		} else {
			vars.layout = 'layout';
		}
	}
	res.render(page, vars);
}