const { ObjectId } = require("mongodb");
const { helpers } = require("../utils/helpers");
const { User } = require("./models/user.model");
const { usersCollection } = require("../config/mongoCollections");
const mongoCollections = require("../config/mongoCollections");
const auth = mongoCollections.usersCollection;

const getUserById = async(id) => {
    // TODO validations
    const usersDB = await usersCollection();
    const user = await usersDB.findOne({ _id: ObjectId(id) });
    if (user === null) throw new Error("No user with that id");

    return new User().deserialize(user);
};

const verifyUser = async(userId) => {
    // TODO validations
    const usersDB = await usersCollection();
    const updatedInfo = await usersDB.updateOne({ _id: ObjectId(userId) }, { isVerified: true });
    if (updatedInfo.modifiedCount === 0) {
        throw "Could not verify user successfully";
    }

    return await getUserById(userId);
};

const enterUser = async(firstName, lastName, email, phoneNumber, password) => {
    newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        password: password,
    };

    const authCollection = await auth();
    const inUser = await authCollection.insertOne(newUser);
    if (!inUser.acknowledged || !inUser.insertedId) {
        console.log("Cannot add User");
    }

    return true;
};

module.exports = {
    getUserById,
    verifyUser,
    enterUser,
};