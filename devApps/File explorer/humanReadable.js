//dates
var time = {
	minuet: 1000*60,
	hour: (1000*60*60),
	day: (1000*60*60*24),
	week: (1000*60*60*24*7),
	month: (1000*60*60*24*31),
	year: (1000*60*60*24*365)
};
var days = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];
exports.dateToString = function(date){
	//date is unix timestamp
	var dateObj = new Date(date);
	var currentDate = new Date();
	var timePassed = Date.now() - date;
	
	var dateString = dateObj.getDate() + '/' + dateObj.getMonth() + '/' + dateObj.getFullYear().toString().substring(2, 4);
	var timeString = format12Time(dateObj);
	
	if(timePassed < time.day && dateObj.getDate() == currentDate.getDate()){
		dateString = 'Today';
	} else if(timePassed < (time.day*2) && dateObj.getDate() == currentDate.getDate()-1){
		dateString = 'Yesterday';
	} else if(timePassed < time.week){ //if within the last week;
		dateString = days[dateObj.getDay()]; //just use day name (eg. monday)
	}
	return dateString + ' ' + timeString;
};

function format12Time(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

//file sizes
exports.filesizeToString = function(bytes) {
    var thresh = 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};