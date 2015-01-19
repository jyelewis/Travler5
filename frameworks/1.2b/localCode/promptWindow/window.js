$(".button").click(function(){
	window.emit('btnClick', $(this).text());
});