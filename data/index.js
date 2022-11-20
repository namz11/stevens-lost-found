const userData = require('./users');
const itemsData = require('./items');
const userVerificationData = require('./userVerification');

module.exports = {
	userDL: userData, // userDataLayer
	userVerificationDL: userVerificationData, // userVerifyDataLayer
	itemsDL: itemsData, // itemsDataLayer
};
