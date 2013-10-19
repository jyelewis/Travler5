process.title = 'Travler (com.jyelewis.test)';

process.on('message', function(i){
//	process.send(++i);
});

setTimeout(function(){
	console.log('yo ho ho');
}, 10000);