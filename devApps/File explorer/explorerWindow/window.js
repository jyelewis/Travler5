jQuery.getScript($("#scriptURL").attr('data-url')).done(function(){
	$("#fileTable").colResizable({
		liveDrag: true
	});
});