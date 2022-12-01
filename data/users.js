const { ObjectId } = require("mongodb");
const { helpers, checkId } = require("../utils/helpers");
const { User } = require("./models/user.model");
const { usersCollection } = require("../config/mongoCollections");

const getUserById = async (userId) => {
  userId = checkId(userId, "User ID");

  const usersDB = await usersCollection();
  const user = await usersDB.findOne({ _id: ObjectId(userId) });
  if (user === null) throw new Error("No user with that id");

  return new User().deserialize(user);
};

const verifyUser = async (userId) => {
  userId = checkId(userId, "User ID");
  const userById = await getUserById(userId); // this will throw error if no user found

  const usersDB = await usersCollection();
  const updatedInfo = await usersDB.updateOne(
    { _id: ObjectId(userId) },
    { $set: { isVerified: true } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw "Could not verify user successfully";
  }

  return await getUserById(userId);
};

const enterUser = async (firstName, lastName, email, phoneNumber, password) => {
  newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phoneNumber,
    password: password,
  };

  const authCollection = await usersCollection();
  const inUser = await authCollection.insertOne(newUser);
  if (!inUser.acknowledged || !inUser.insertedId) {
    console.log("Cannot add User");
  }

  // return true;
  return await getUserById(inUser.insertedId.toString());
};

module.exports = {
  getUserById,
  verifyUser,
  enterUser,
};
