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
    user: "stevenslostandfound@gmail.com",
    pass: "nobxkeewzuecsyma",
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
      from: "stevenslostandfound@gmail.com",
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

const sendListingUpdateEmail = async (
  { user, userId, userItem, actor, actorId, actorNumber, action },
  res
) => {
  try {
    const mailOptions = {
      from: "stevenslostandfound@gmail.com",
      to: userId,
      subject: `<strong>Update</strong>: ${actor} has ${action} your item`,
      html: `<p>Hi <strong>${user}</strong>, your <em>"${userItem}"</em> has been <strong>${action}</strong> by <em>${actor}</em>.</p> <br> 
      <p>Here are the contact details of <em>${actor}</em>:</p><br> 
      <ul>
      <li>Name: ${actor}</li>
      <li>Email: <a href = "mailto: ${actorId}">${actorId}</a></li>
      <li>Number: ${actorNumber}</li>
      <li>Has: ${action}</li>
      </ul>`,
      // TODO (AMAN): Display an image of the item
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Please Try Again",
    });
  }
};

const sendListingUpdateEmailToActor = async (
  { user, userId, userItem, userNumber, actor, actorId, action },
  res
) => {
  try {
    const mailOptions = {
      from: "narmitmashruwala@gmail.com",
      to: actorId,
      subject: `<strong>Update for ${action} item</strong>: Here are the contact details for <em>"${userItem}"</em>`,
      html: `<p>Hi ${actor} Here are the contact details of <em>${user}</em>, who posted for <em>${userItem}</em>:</p><br> 
      <ul>
      <li>Name: ${user}</li>
      <li>Email: <a href = "mailto: ${userId}">${userId}</a></li>
      <li>Number: ${userNumber}</li>
      </ul>`,
      // TODO (AMAN): Display an image of the item
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Please Try Again",
    });
  }
};

const sendForgotPasswordLinkEmail = async ({ id, email, redirect }, res) => {
  try {
    const url = `http://localhost:3000/auth/reset-password/${id}`;

    const mailOptions = {
      from: "stevenslostandfound@gmail.com",
      to: email || "stevenslostandfound@gmail.com",
      subject: "Reset Your Password",
      html: `<p><a href='${url}'>Click here to reset your password</a></p> <p>Reset your password and start using the application.</p>`,
    };

    await transporter.sendMail(mailOptions);

    if (redirect) {
      return res.redirect("/auth/login");
    } else {
      return res.json({
        success: true,
        message: "Link has been sent to your email",
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
  sendListingUpdateEmail,
  sendForgotPasswordLinkEmail,
  sendListingUpdateEmailToActor,
};
