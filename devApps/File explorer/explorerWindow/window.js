jQuery.getScript(window.urlForResource('colResizable.js')).done(function(){
	bindToList($("#fileAnimationContainer .fileContainer"));
});

//button bindings
$("#btnUp").click(function(){
	window.emit('upDir');
});
//end buttons

var animationTime = 300;

window.on('setFileList', function(fileList, animation){
	if(!animation){
		$("#fileAnimationContainer").html(fileList);
		bindToList($("#fileAnimationContainer .fileContainer"));
	} else if(animation == "slideDown"){ //.......................slideDown
		$("#fileAnimationContainer").prepend(fileList)
		var newDiv = $("#fileAnimationContainer .fileContainer").first().hide().slideDown(animationTime)
		$("#fileAnimationContainer .fileContainer").last().slideUp(animationTime);
		
		bindToList(newDiv);
		
		setTimeout(function(){
			$("#fileAnimationContainer .fileContainer").last().remove();
		}, animationTime);
		
	} else if(animation == "slideRight"){ //.......................slideRight
		$("#fileAnimationContainer").prepend(fileList);		
		var newDiv = $("#fileAnimationContainer .fileContainer").first();
		var oldDiv = $("#fileAnimationContainer .fileContainer").last();
		
		bindToList(newDiv);
		
		$("#fileAnimationContainer .fileContainer").css('position', 'absolute');
		newDiv.width(newDiv.width());
		oldDiv.width(oldDiv.width());
		newDiv.css('left', -newDiv.outerWidth());
		
		newDiv.animate({
			left:0
		}, animationTime);
		
		oldDiv.animate({
			right: -oldDiv.outerWidth()
		}, animationTime);
		
		setTimeout(function(){
			oldDiv.remove();
			newDiv.css('width', "auto").css("position", "static");
		}, animationTime);
	} else if(animation == "slideLeft"){ //.......................slideLeft
		$("#fileAnimationContainer").prepend(fileList);		
		var newDiv = $("#fileAnimationContainer .fileContainer").first();
		var oldDiv = $("#fileAnimationContainer .fileContainer").last();
		
		bindToList(newDiv);
		
		$("#fileAnimationContainer .fileContainer").css('position', 'absolute');
		newDiv.width(newDiv.width());
		oldDiv.width(oldDiv.width());
		newDiv.css('right', -newDiv.outerWidth());
		
		newDiv.animate({
			right:0
		}, animationTime);
		
		oldDiv.animate({
			left: -oldDiv.outerWidth()
		}, animationTime);
		
		setTimeout(function(){
			oldDiv.remove();
			newDiv.css('width', "auto").css("position", "static");
		}, animationTime);
	} else { //if animation is not known fade
		$("#fileAnimationContainer").prepend(fileList);
		var newDiv = $("#fileAnimationContainer .fileContainer").first();
		var oldDiv = $("#fileAnimationContainer .fileContainer").last();
		
		bindToList(newDiv);
		
		newDiv.hide();
		
		oldDiv.fadeOut(animationTime/2, function(){
			oldDiv.remove();
			newDiv.fadeIn(animationTime/2);
		});
	}
});

function bindToList(newList){
	newList.children(".fileTable").colResizable({
		liveDrag: true
	});
	newList.children(".fileTable").children("tbody").children(".file").click(function(){
		window.emit('fileClick', $(this).attr('data-fileID'));
	});
}



//file upload code
(function(){
if (File && FileList && FileReader) {
	$("#fileUploadContainer").remove();
	$("#fileUploadDrop").on('drop', FileSelectHandler)
		.on(
		'dragover',
		function(e) {
			e.preventDefault();
			e.stopPropagation();
		})
		.on(
		'dragenter',
		function(e) {
			e.preventDefault();
			e.stopPropagation();
		});
} else {
	$("#fileUpload").on('change', FileSelectHandler);
}

function FileSelectHandler(e) {
	e.preventDefault();
    e.stopPropagation();
        
    e = e.originalEvent; //e is a jquery event
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
		ParseFile(f);
	}
}

var uploadingFiles = {};

function ParseFile(file){
	window.emit('uploadStart', { name: file.name, size:file.size });
	/*var reader = new FileReader();
	reader.onload = function(evnt){
		window.emit('uploadData', { name:file.name, data: evnt.target.result });
	};
	reader.readAsText(file);
	*/
	uploadingFiles[file.name] = file;
}

window.on('uploadMoreData', function (data){
	var reader = new FileReader();
	var file = uploadingFiles[data.name];
	var place = data.place * 524288; //The Next Blocks Starting Position
	var newFile = file.slice(place, place + Math.min(524288, (file.size-place)));
	
	reader.onload = function(evnt){
		window.emit('uploadData', { name:file.name, data: evnt.target.result, uploadID:data.uploadID });
	};
	
	reader.readAsBinaryString(newFile);
});

})();

/*function StartUpload(){
   if(document.getElementById('FileBox').value != "")
   {
      FReader = new FileReader();
      Name = document.getElementById('NameBox').value;
      var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
      Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
      Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";
      document.getElementById('UploadArea').innerHTML = Content;
      FReader.onload = function(evnt){
         socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
      }
      socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
   }
   else
   {
      alert("Please Select A File");
   }
}*/







