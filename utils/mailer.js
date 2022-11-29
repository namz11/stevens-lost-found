const nodemailer = require("nodemailer");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
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

const sendOTPVerificationEmail = async ({ userId, email, redirect }, res) => {
  try {
    const otp = _.random(1000, 9999);

    const mailOptions = {
      from: "narmitmashruwala@gmail.com",
      to: email || "nmashruw@stevens.edu",
      subject: "Verify Your Email",
      html: `<p>Enter <strong>${otp}</strong> in the <a href='http://localhost:3000/auth/verify'>app</a> to verify your email address and complete registration to start using the application.</p><p>Note: This otp is valid only for 24h hours.</p>`,
    };

    let verifyObj = await userVerificationDL.createUserVerification({
      userId,
      otp,
    });

    await transporter.sendMail(mailOptions);

    if (redirect) {
      return res.redirect("/auth/verify");
    } else {
      return res.json({
        success: true,
        message: "OTP is sent to your email",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred. Try again.",
    });
  }
};

module.exports = {
  sendOTPVerificationEmail,
};
