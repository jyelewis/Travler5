function appForExtention(fileExtention){

}

function open(file) {
	
}

function setDefaultApp(fileExtention, appID){
	var obj = {};
	obj[fileExtention] = appID;
	app.data.save('test data', obj);
}

exports.setDefaultApp = setDefaultApp;
exports.open = open