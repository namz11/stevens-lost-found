const { ObjectId } = require("mongodb");
const { helpers } = require("../utils/helpers");
const { UserOTPVerification } = require("./models/userOTPVerification.model");
const {
  userVerificationCollection,
  usersCollection,
} = require("../config/mongoCollections");

const createUserVerification = async (verifyObj) => {
  // TODO validations
  const userVerificationDB = await userVerificationCollection();
  const insertInfo = await userVerificationDB.insertOne(verifyObj);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not create user verification entry";

  const added = { ...verifyObj, _id: insertInfo.insertedId.toString() };
  return new UserOTPVerification().deserialize(added);
};

const getUserVerificationByUserId = async (userId) => {
  // TODO validations
  const userVerificationDB = await userVerificationCollection();
  const verifications = await userVerificationDB.findOne({
    userId: ObjectId(userId),
  });
  return verifications?.map((x) => new UserOTPVerification().deserialize(x));
};

const deleteMany = async (userId) => {
  // TODO validations
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
