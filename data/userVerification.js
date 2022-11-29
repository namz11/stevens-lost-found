const { ObjectId } = require("mongodb");
const { validations, helpers, checkId } = require("../utils/helpers");
const { UserOTPVerification } = require("./models/userOTPVerification.model");
const {
  userVerificationCollection,
  usersCollection,
} = require("../config/mongoCollections");
const bcrypt = require("bcryptjs");

const createUserVerification = async (verifyObj) => {
  verifyObj.userId = checkId(verifyObj.userId, "User ID");

  const usersDB = await usersCollection();
  const userById = await usersDB.findOne({ _id: ObjectId(verifyObj.userId) });
  if (userById === null) throw new Error("No user with that id");

  if (!helpers.isNumberValid(verifyObj?.otp)) {
    throw new Error("OTP must be a number");
  }
  if (!validations.isOTPValid(verifyObj?.otp)) {
    throw new Error("Invalid OTP generated. Try again.");
  }
  const hashedOtp = await bcrypt.hash(
    helpers.sanitizeString("" + verifyObj?.otp),
    10
  );
  const newObj = new UserOTPVerification(verifyObj.userId, hashedOtp);

  const userVerificationDB = await userVerificationCollection();
  const insertInfo = await userVerificationDB.insertOne(newObj);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not create user verification entry";

  const added = { ...verifyObj, _id: insertInfo.insertedId.toString() };
  return new UserOTPVerification().deserialize(added);
};

const getUserVerificationByUserId = async (userId) => {
  userId = checkId(userId, "User ID");

  const usersDB = await usersCollection();
  const userById = await usersDB.findOne({ _id: ObjectId(userId) });
  if (userById === null) throw new Error("No user with that id");
  // const userById = await userDL.getUserById(userId); // this will throw error if no user found

  const userVerificationDB = await userVerificationCollection();
  const verification = await userVerificationDB.findOne({
    userId: ObjectId(userId),
  });
  return new UserOTPVerification().deserialize(verification);
};

const deleteMany = async (userId) => {
  userId = checkId(userId, "User ID");

  const usersDB = await usersCollection();
  const userById = await usersDB.findOne({ _id: ObjectId(userId) });
  if (userById === null) throw new Error("No user with that id");
  // const userById = await userDL.getUserById(userId); // this will throw error if no user found

  const userVerificationDB = await userVerificationCollection();
  const verifications = await userVerificationDB.deleteMany({
    userId: ObjectId(userId),
  });
  return await getUserVerificationByUserId(userId);
};

module.exports = {
  createUserVerification,
  getUserVerificationByUserId,
  deleteMany,
};
