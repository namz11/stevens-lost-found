const { ObjectId } = require('mongodb');
const { helpers } = require('../../utils/helpers');

class User {
	constructor(obj) {
		this.firstName = helpers.sanitizeString(obj.firstName);
		this.lastName = helpers.sanitizeString(obj.lastName);
		this.email = helpers.sanitizeString(obj.email);
		this.phone = helpers.sanitizeString(obj.phone);
		this.password = obj.password; // TODO encrypt pwd
	}

	deserialize(user) {
		user = {
			...user,
			_id: user?._id?.toString(),
		};
		delete user.password; // do not let the frontend have access to pwd field
		return user;
	}

	serialize(user) {
		user = {
			...user,
			_id: new ObjectId(user?._id),
		};
		delete user.password; // do not let the frontend have access to pwd field
		return user;
	}
}

export { User };
