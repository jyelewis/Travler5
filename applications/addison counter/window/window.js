var number = parseInt($("#divNum").text());

$("#btnPlus").click(function(){
	number = number + 1;
	$("#divNum").text(number);
	window.emit('numberChanged', number);
});

$("#btnMinus").click(function(){
	number = number - 1;
	$("#divNum").text(number);
	window.emit('numberChanged', number);
});