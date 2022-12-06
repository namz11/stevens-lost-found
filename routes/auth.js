const express = require("express");
const router = express.Router();
const path = require("path"); // can you for static files if needed
const {
  UserOTPVerification,
} = require("../data/models/userOTPVerification.model");
const { userVerificationDL, userDL } = require("../data");
const {
  sendOTPVerificationEmail,
  sendForgotPasswordLinkEmail,
} = require("../utils/mailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const initializePassport = require("../utils/passport");
const {
  checkId,
  checkPassword,
  checkEmail,
  checkName,
  checkPhoneNumber,
  checkDOB,
} = require("../utils/helpers");

const saltRounds = 10;

initializePassport(passport, (email) =>
  users.find((user) => user.email === email)
);

router.route("/").get(checkAuthenticated, async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../static/index.html"));
    //Change the above route to go to user account.
    //you can find user (whose is logged in), details at req.session.passport
  } catch {
    console.log("Error");
  }
});

router
  .route("/register")
  .get(checkNotAuthenticated, async (req, res) => {
    // renders register page
    res.render("auth/register", { title: "Register", layout: "main" });
  })
  .post(checkNotAuthenticated, async (req, res) => {
    // create user
    try {
      userEmail = checkEmail(req.body.email);
      userPassword = checkPassword(req.body.password);
      userFirstName = checkName(req.body.firstName, "First Name");
      userLastName = checkName(req.body.lastName, "Last Name");
      userPhoneNumber = checkPhoneNumber(req.body.phoneNumber);
      userDOB = checkDOB(req.body.dateOfBirth);
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      const result = await userDL.enterUser(
        userFirstName,
        userLastName,
        userEmail,
        userPhoneNumber,
        userDOB,
        hashedPassword
      );

      return sendOTPVerificationEmail(
        { userId: result?._id, email: result?.email, redirect: true },
        res
      );
    } catch (e) {
      console.log(e);
      res.render("auth/register", {
        layout: "main",
        title: "Register",
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        dateOfBirth: req.body.dateOfBirth,
        error: e,
      });
    }
  });

router
  .route("/login")
  .get(checkNotAuthenticated, async (req, res) => {
    res.render("auth/login", { title: "Login", layout: "main" });
  })
  .post(
    checkNotAuthenticated,
    takingInUser,
    passport.authenticate("local", {
      successRedirect: "/auth/",
      failureRedirect: "/auth/login",
      failureFlash: true,
    })
  );

router
  .route("/forgot-password")
  .get(checkNotAuthenticated, async (req, res) => {
    // renders page where user can set new pwd
    res.render("auth/forgotPassword", {
      title: "Forgot Password",
      layout: "main",
    });
  })
  .post(checkNotAuthenticated, async (req, res) => {
    // post new pwd to DB
    // redirect to login

    try {
      userEmail = checkEmail(req.body.email);
      const userByEmail = await userDL.getUserByEmail(userEmail);
      sendForgotPasswordLinkEmail(
        { id: userByEmail._id, email: userByEmail.email, redirect: true },
        res
      );
    } catch (e) {
      return res.render("auth/forgotPassword", {
        layout: "main",
        title: "Forgot Password",
        error: e,
      });
    }
  });

router
  .route("/reset-password/:id")
  .get(checkNotAuthenticated, async (req, res) => {
    return res.render("auth/resetPassword", {
      layout: "main",
      title: "Reset Password",
      id: req.params.id,
    });
  })
  .post(checkNotAuthenticated, async (req, res) => {
    try {
      userPassword = checkPassword(req.body.newPassword);
      const userPasswordUpdate = await userDL.updatePassword(
        req.params.id,
        req.body.newPassword
      );
      res.redirect("/auth/login");
    } catch (e) {
      return res.render("auth/resetPassword", {
        layout: "main",
        title: "Reset Password",
        id: req.params.id,
        error: e,
      });
    }
  });

//#region user verify
router
  .route("/verify")
  .get(async (req, res) => {
    // renders page where user can enter otp
    return res.render("auth/verifyUser", {
      title: "Verify User",
      layout: "main",
    });
  })
  .post(async (req, res) => {
    let { userId, otp } = req.body;

    try {
      userId = checkId(userId, "User ID");
    } catch (e) {
      console.log(e);
      return res.status(400).send(new Error(e.message));
    }

    try {
      const userById = await userDL.getUserById(userId);
    } catch (e) {
      console.log(e);
      return res.status(404).send(new Error("User not found"));
    }

    try {
      const verification = await userVerificationDL.getUserVerificationByUserId(
        userId
      );

      if (verification) {
        if (verification.expiresAt < Date.now()) {
          await userVerificationDL.deleteMany(userId);
          res.status(403).json({
            success: false,
            message: "Code has expired. Try again",
          });
        } else {
          const compare = await bcrypt.compare(otp, verification.otp);
          if (compare) {
            const userObj = await userDL.verifyUser(userId);
            await userVerificationDL.deleteMany(userId); // delete verification data after success
            res.json({
              success: true,
              message: "User verified",
              data: userObj,
            });
          } else {
            res.status(403).json({
              success: false,
              message: "Invalid code. Check your inbox",
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  });

router.route("/resend-otp").post(async (req, res) => {
  let { userId, email } = req.body;

  try {
    userId = checkId(userId, "User ID");
  } catch (e) {
    console.log(e);
    return res.status(400).send(new Error(e.message));
  }

  try {
    const userById = await userDL.getUserById(userId);
  } catch (e) {
    console.log(e);
    return res.status(404).send(new Error("User not found"));
  }

  try {
    await userVerificationDL.deleteMany(userId);
    return sendOTPVerificationEmail({ userId, email }, res);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

//#endregion
router.route("/logout").delete(async (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
    // return res.json({ logout: true });
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/auth/");
  }
  next();
}

async function takingInUser(req, res, next) {
  try {
    userEmail = checkEmail(req.body.email);
    userPassword = checkPassword(req.body.password);
    next();
  } catch (e) {
    return res.render("auth/login", {
      layout: "main",
      title: "Login",
      error: e,
      emailEntered: req.body.email,
      passEntered: req.body.password,
    });
  }
}

module.exports = router;
