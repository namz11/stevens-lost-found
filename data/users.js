const { ObjectId } = require("mongodb");
const {
  helpers,
  checkId,
  checkEmail,
  checkName,
  checkPassword,
  checkPhoneNumber,
  checkDOB,
} = require("../utils/helpers");
const { User } = require("./models/user.model");
const { usersCollection } = require("../config/mongoCollections");
const bcrypt = require("bcryptjs");

const saltRounds = 10;

const getUserById = async (userId) => {
  userId = checkId(userId, "User ID");

  const usersDB = await usersCollection();
  const user = await usersDB.findOne({ _id: ObjectId(userId) });
  if (user === null) throw new Error("No user with that id");

  return new User().deserialize(user);
};

const getUserByEmail = async (userEmail) => {
  email = checkEmail(userEmail);
  const usersDB = await usersCollection();
  const user = await usersDB.findOne({ email: email });
  if (user === null) throw new Error("No user with that email");

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

const enterUser = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  dob,
  password
) => {
  userEmail = checkEmail(email);
  userFirstName = checkName(firstName, "First Name");
  userLastName = checkName(lastName, "Last Name");
  userPhoneNumber = checkPhoneNumber(phoneNumber);

  userDOB = checkDOB(dob);

  const authCollection = await usersCollection();
  const userExists = await authCollection.findOne({ email: userEmail });
  if (userExists) {
    throw new Error("There is already a user with that email.");
  }

  newUser = {
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
    phone: userPhoneNumber,
    dob: userDOB,
    password: password,
  };

  const userToBeInserted = new User(newUser);
  const inUser = await authCollection.insertOne(userToBeInserted);
  if (!inUser.acknowledged || !inUser.insertedId) {
    throw new Error("Cannot add User");
  }

  return await getUserById(inUser.insertedId.toString());
};

const updatePassword = async (userId, password) => {
  userId = checkId(userId, "User ID");
  userPassword = checkPassword(password);

  const usersDB = await usersCollection();
  const userById = await usersDB.findOne({ _id: ObjectId(userId) });
  if (!userById) {
    throw new Error(
      "The user whose password you are attempting to update does not exist."
    );
  }
  if (await bcrypt.compare(userPassword, userById.password)) {
    throw new Error("It is already the current password");
  }

  const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
  let updatedPassword = {
    password: hashedPassword,
  };

  const user = await usersDB.updateOne(
    { _id: ObjectId(userId) },
    { $set: updatedPassword }
  );
  if (user === null) throw new Error("Cannot Update Password");

  return new User().deserialize(user);
};

module.exports = {
  getUserById,
  verifyUser,
  enterUser,
  getUserByEmail,
  updatePassword,
};
