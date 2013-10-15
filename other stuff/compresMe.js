function test(test){
	var str = "blah"
	return test+str;
}
if(!false){
	console.log('blah');
}
function notCalled(){
	var test = 'blah';
};
(function(){
	var helaslo = 'delete me';
	//console.log(helaslo);
})();
console.log(test('hello'));
console.log(new Array());