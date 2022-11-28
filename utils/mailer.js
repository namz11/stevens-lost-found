const nodemailer = require("nodemailer");
const _ = require("lodash");
const {
  UserOTPVerification,
} = require("../data/models/userOTPVerification.model");
const { userVerificationDL } = require("../data");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "narmitmashruwala@gmail.com",
    pass: "kcgxuhvcglbwngbd",
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  }
});

const sendOTPVerificationEmail = async ({ userId, email }, res) => {
  try {
    const otp = _.random(1000, 9999);

    const mailOptions = {
      from: "narmitmashruwala@gmail.com",
      to: email || "nmashruw@stevens.edu",
      subject: "Verify Your Email",
      html: `<p>Enter <strong>${otp}</strong> in the app to verify your email address and complete registration to start using the application.</p><p>Note: This otp is valid only for 24h hours.</p>`,
    };

    // TODO encrypt otp before saving
    let verifyObj = new UserOTPVerification(userId, otp);
    verifyObj = await userVerificationDL.createUserVerification(verifyObj);

    await transporter.sendMail(mailOptions);
    return "Verification otp sent";

    // TODO send success to user
  } catch (error) {
    // TODO send error to user
    console.log(error);
    return error;
  }
};

module.exports = {
  sendOTPVerificationEmail,
};
