const express = require("express");
const router = express.Router();
const path = require("path"); // can you for static files if needed
const {
  UserOTPVerification,
} = require("../data/models/userOTPVerification.model");
const { userVerificationDL, userDL } = require("../data");
const { sendOTPVerificationEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStorage = require("node-localstorage").LocalStorage;
var localStorage = new LocalStorage("./scratch");
const initializePassport = require("../utils/passport");
const { checkId } = require("../utils/helpers");

initializePassport(passport, (email) =>
  users.find((user) => user.email === email)
);

router.route("/").get(checkAuthenticated, async (req, res) => {
  try {
    const user = localStorage.getItem("user");
    res.sendFile(path.join(__dirname, "../static/index.html"));
  } catch {
    console.log("Error");
  }
});

router
  .route("/register")
  .get(checkNotAuthenticated, async (req, res) => {
    // renders register page
    res.render("templates/register", { title: "Register" });
  })
  .post(checkNotAuthenticated, async (req, res) => {
    // create user
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const result = await userDL.enterUser(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.phoneNumber,
        hashedPassword
      );

      return sendOTPVerificationEmail(
        { userId: result?._id, email: result?.email, redirect: true },
        res
      );
      // res.redirect("/auth/verify");
    } catch (e) {
      console.log(e);
      res.redirect("/auth/register");
    }
  });

router
  .route("/login")
  .get(checkNotAuthenticated, async (req, res) => {
    res.render("templates/login", { title: "Login" });
  })
  .post(
    checkNotAuthenticated,
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
    res.render("templates/forgotPwd", { title: "Forgot Password" });
  })
  .post(checkNotAuthenticated, async (req, res) => {
    // post new pwd to DB
    // redirect to login
  });

//#region user verify
router
  .route("/verify")
  .get(async (req, res) => {
    // renders page where user can enter otp
    return res.render("auth/verifyUser", {
      title: "Verify User",
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
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
    localStorage.clear();
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("This not");
  res.redirect("/auth/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/auth/");
  }
  next();
}

module.exports = router;
