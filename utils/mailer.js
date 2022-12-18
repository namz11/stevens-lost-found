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
    pass: "kmuzbvuvqjljvrsr",
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
      html: `<p>Enter <strong>${otp}</strong> in the <a href='http://localhost:3000/auth/verify'>app</a> to verify your email address and complete registration to start using the application.</p><p>Note: This otp is valid only for 24h hours.</p> <br><p>If you cannot click on the link provided, copy paste http://localhost:3000/auth/verify in your browser.</p><br><br> Cheers,<br>
      Stevens - Lost & Found`,
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
    return res.status(500).json({
      success: false,
      message: "Some error occurred. Try again.",
    });
  }
};

const sendListingUpdateEmail = async ({
  user,
  userId,
  userItem,
  actor,
  actorId,
  actorNumber,
  action,
  finderOrOwner,
}) => {
  try {
    const mailOptions = {
      from: "stevenslostandfound@gmail.com",
      to: userId,
      subject: `Update: ${actor} has ${action} your item`,
      html: `<p>Dear <strong>${user}</strong>, <br>

      We are glad to inform you that a '${action}' report for your <em>"${userItem}"</em> has been received. Feel free to contact the ${finderOrOwner} using the details given below:<br>

           <ul>
           <li>Name: ${actor}</li>
           <li>Email: <a href = "mailto: ${actorId}">${actorId}</a></li>
           <li>Number: ${actorNumber}</li>
           </ul>

      <br>
      Please contact <em>${actor}</em> to arrange for the return/pickup of your item.<br>
      <br>
      Thank you for your patience.
      <br>
      <br>
      Cheers,<br>
      Stevens - Lost & Found`,
    };

    // Handle the result of the sendMail call
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    // Handle any errors that may occur
    return res.status(500).json({
      success: true,
      emailSent: false,
      message:
        "Unable to send email to the user who listed the item. Please contact website admin.",
    });
  }
};

const sendListingUpdateEmailToActor = async (
  { user, userId, userItem, userNumber, actor, actorId, action, finderOrOwner },
  res
) => {
  try {
    const mailOptions = {
      from: "stevenslostandfound@gmail.com",
      to: actorId,
      subject: `Update for ${action} item: Here are the contact details for "${userItem}"`,
      html: `<p>Hi <strong>${actor}</strong>, <br>

      We have received a <strong>'${action}'</strong> report for the item <em>"${userItem}"</em> by you. We have forwarded your contact information to the ${finderOrOwner} and encouraged them to reach out to you to arrange for the return/pickup of the item.<br>

In the meantime, please do not hesitate to contact the ${finderOrOwner} using the following details if you need to discuss anything further:<br>
      
           <ul>
           <li>Name: ${user}</li>
           <li>Email: <a href = "mailto: ${userId}">${userId}</a></li>
           <li>Number: ${userNumber}</li>
           </ul>
      <br>
      Feel free to contact <em>${user}</em> to arrange for the return/pickup of your item.<br>
      We are grateful for your efforts and hope to see you again soon!

<br>
<br>

      Cheers,<br>
      Stevens - Lost & Found`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      emailSent: false,
      message: "Unable to send email to you. Please contact website admin.",
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
      html: `<p><a href='${url}'>Click here to reset your password</a></p> <p>Reset your password and start using the application.</p><br><p>If you cannot click on the link provided, copy paste ${url} in your browser.</p><br><br> Cheers,<br>
      Stevens - Lost & Found`,
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
