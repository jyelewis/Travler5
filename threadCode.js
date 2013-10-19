thread.on('count', function(i){
	if(i == 100000){
		console.log(i + ' finished');
		/*process.nextTick(function(){
			console.log();
		});*/
		console.log(thread)
		return;
	}
	thread.emit('count', ++i);
});


thread.emit('count', 1);