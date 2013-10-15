window.UI.on('load', function(){ //should run every time
	tinymce.init({
		selector: "textarea",
		plugins: [
			"advlist autolink lists link image charmap print preview anchor",
			"searchreplace visualblocks code fullscreen",
			"insertdatetime media table contextmenu paste"
		],
		toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
	});
});

window.UI.on('ready', function(){ //should run only the first time the window is opened

});

window.UI.on('recover', function(a, recov){ //should run only on recovery
	tinyMCE.editors[$("textarea").attr('id')].setContent(recov.editData);
});

window.UI.freeze = function(){
	return {
		editData: tinyMCE.editors[$("textarea").attr('id')].getContent()
	};
};