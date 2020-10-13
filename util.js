export const formatDate =  function(value) {
	var date = new Date();
	//date.setTime(value);
	var month = date.getMonth() + 1;
	var hours = date.getHours();
	if (hours < 10)
		hours = "0" + hours;
	var minutes = date.getMinutes();
	if (minutes < 10)
		minutes = "0" + minutes;
	console.log(1231)
	var seconds = date.getSeconds().toString().padStart(2, '0')
	console.log(seconds)
	var time = date.getFullYear() + "-" + month + "-" + date.getDate() +
		" " + hours + ":" + minutes + ":" + seconds;
	return time;
}
