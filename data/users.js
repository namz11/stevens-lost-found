const { ObjectId } = require('mongodb');
const { helpers } = require('../utils/helpers');
const { User } = require('./models/users.model');
const { usersCollection } = require('../config/mongoCollections');

const getUserById = async (id) => {
	// TODO validations
	const usersDB = await usersCollection();
	const user = await usersDB.findOne({ _id: ObjectId(id) });
	if (user === null) throw new Error('No user with that id');

	return new User().deserialize(user);
};

const verifyUser = async (userId) => {
	// TODO validations
	const usersDB = await usersCollection();
	const updatedInfo = await usersDB.updateOne(
		{ _id: ObjectId(userId) },
		{ isVerified: true }
	);
	if (updatedInfo.modifiedCount === 0) {
		throw 'Could not verify user successfully';
	}

	return await getUserById(userId);
};

module.exports = {
	getUserById,
	verifyUser,
};
