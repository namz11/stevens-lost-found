const { ObjectId } = require("mongodb");
const { helpers } = require("../../utils/helpers");

const HOURS_24_IN_MS = 86400000; // 24hours in milliseconds

class UserOTPVerification {
  constructor(userId, otp) {
    this.userId = userId ? new ObjectId(helpers.sanitizeString(userId)) : "";
    this.otp = otp;
    this.createdAt = new Date().valueOf();
    this.expiresAt = new Date().valueOf() + HOURS_24_IN_MS;
  }

  deserialize(obj) {
    obj = {
      ...obj,
      _id: obj?._id?.toString(),
      userId: obj?.userId?.toString(),
    };
    return obj;
  }
}

module.exports = { UserOTPVerification };
