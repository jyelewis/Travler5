window.on('download', function(filename, url){
	$("#downloadList").append('<div class="download">'+filename+'</div>');
	$("#downloadFrame").prop('src', url);
	storeCode();
});

window.on('upload', function(uploadID, filename, statusText){
	$("#downloadList").append('<div class="upload" data-id="'+uploadID+'">'+filename+'<div>'+statusText+'</div></div>');
	storeCode();
});

window.on('uploadChange', function(uploadID, filename, statusText){
	$("#downloadList div[data-id="+uploadID+"]").html(filename+'<div>'+statusText+'</div>');
	storeCode();
});

function storeCode(){
	window.emit('storeCode', $("#downloadList").html());
}