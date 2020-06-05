const moment = require('moment');

function messageData(adminName, message) {
	return {
		adminName,
		message,
		time: moment().format('h:mm a'),
	};
}

module.exports = messageData;
