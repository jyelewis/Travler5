var fs = require('fs');
var FileTransfer = app.useModule('fileTransfer').FileTransfer;

var transferWindow;
var totalTransfers = 0;

var currentUploads = {};

exports.download = function(filePath){
	var downloadTransfer = new FileTransfer(filePath);
	
	if (!transferWindow){
		setupTransfersWindow(function(isRecovery){
			if (!isRecovery){
				transferWindow.emit('download', basename(filePath), downloadTransfer.url);
				totalTransfers++;
				transferWindow.height = calcWindowHeight(totalTransfers);
			}
		});
	} else {
		transferWindow.emit('download', basename(filePath), downloadTransfer.url);
		totalTransfers++;
		transferWindow.height = calcWindowHeight(totalTransfers);
	}
};

exports.bindUpload = function(explorerWindow){
	explorerWindow.window.on('uploadStart', function(data){
		var uploadID = makeID(4);
		currentUploads[uploadID] = {
			  name: data.name
			, size: data.size
			, uploadedSize: 0
			, data: ''
		};
		//show item in window
		if (!transferWindow){
			setupTransfersWindow(function(isRecovery){
				if (!isRecovery){
					transferWindow.emit('upload', uploadID, data.name, '0% (0/'+data.size+')');
					totalTransfers++;
					transferWindow.height = calcWindowHeight(totalTransfers);
				}
			});
		} else {
			transferWindow.emit('upload', uploadID, data.name, '0% (0/'+data.size+')');
			totalTransfers++;
			transferWindow.height = calcWindowHeight(totalTransfers);
		}
		
		explorerWindow.window.emit('uploadMoreData', {
			name: data.name
			,uploadID:uploadID
			,place: 0
		});
	});
	explorerWindow.window.on('uploadData', function(data){
		var fileObj = currentUploads[data.uploadID];
		fileObj.data += data.data;
		fileObj.uploadedSize += data.data.length;
		if(fileObj.uploadedSize == fileObj.size){
			fs.writeFile(explorerWindow.rootDir + explorerWindow.dir + '/' + data.name, fileObj.data, 'Binary', function(){
				delete(currentUploads[data.uploadID]); //memory clear
				explorerWindow.reload();
				transferWindow.emit('uploadChange', data.uploadID, data.name, 'Upload Complete');
			});
		} else {
			explorerWindow.window.emit('uploadMoreData', {
				name: fileObj.name
				,uploadID:data.uploadID
				,place: fileObj.uploadedSize / 524288
			});
			var uploadedPersentage = ((fileObj.uploadedSize/fileObj.size)*100).toPrecision(2);
			transferWindow.emit('uploadChange', data.uploadID, data.name, uploadedPersentage+'% ('+fileObj.uploadedSize+'/'+fileObj.size+')');
		}
	});
};

//functions
function basename(path){
	if(path == '/') return path;
	if(path.substring(path.length-1) == '/'){
		path = path.substring(0, path.length-1); //remove trailing slash
	}
	var parts = path.split('/');
	var endDirName = parts[parts.length-1];
	delete(parts);
	return endDirName;
}

function calcWindowHeight(transfers){
	return (transfers * 50)+25;
}

function setupTransfersWindow(callback){
	transferWindow = new app.Window();
	transferWindow.title = "File transfers";
	transferWindow.width = 300;
	transferWindow.height = 150;
	transferWindow.vars.recoverHTML = '';
	transferWindow.on('storeCode', function(html){
		transferWindow.vars.recoverHTML = html;
	});
	app.useModule('desktop').getScreenSize(function(size){
		transferWindow.posTop = 30;
		transferWindow.posLeft = size.width - transferWindow.width  - 30;
	});
	transferWindow.render('downloadWindow', callback);
}

function makeID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'a'+text; //start with char
}