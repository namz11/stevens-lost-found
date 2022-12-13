const express = require("express");
const router = express.Router();
const { userVerificationDL, userDL } = require("../data");
const {
  sendOTPVerificationEmail,
  sendForgotPasswordLinkEmail,
} = require("../utils/mailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const initializePassport = require("../utils/passport");
const { checkId, authHelpers } = require("../utils/helpers");

const saltRounds = 10;

initializePassport(passport, (email) =>
  users.find((user) => user.email === email)
);

function isUserAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    if (req?.session?.passport?.user?.isVerified) {
      return res.redirect("/auth/verify");
    } else {
      next();
    }
  }
}

const isUserVerified = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req?.session?.passport?.user?.isVerified) {
      return res.redirect("/");
    } else {
      next();
    }
  } else {
    return res.redirect("/auth");
  }
};

router.get("/", (req, res) => {
  return res.redirect("/auth/login");
});

router
  .route("/register")
  .get(isUserAuthenticated, async (req, res) => {
    // renders register page
    return res.render("auth/register", { title: "Register", layout: "main" });
  })
  .post(isUserAuthenticated, async (req, res) => {
    // create user
    try {
      userEmail = authHelpers.checkEmail(req.body.email);
      userPassword = authHelpers.checkPassword(req.body.password);
      userFirstName = authHelpers.checkName(req.body.firstName, "First Name");
      userLastName = authHelpers.checkName(req.body.lastName, "Last Name");
      userPhoneNumber = authHelpers.checkPhoneNumber(req.body.phoneNumber);
      userDOB = authHelpers.checkDOB(req.body.dateOfBirth);
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
      res.status(400).render("auth/register", {
        layout: "main",
        title: "Register",
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        dateOfBirth: req.body.dateOfBirth,
        error: e.message,
      });
    }
  });

router
  .route("/login")
  .get(isUserAuthenticated, async (req, res) => {
    return res.render("auth/login", { title: "Login", layout: "main" });
  })
  .post(takingInUser, async (req, res, next) => {
    passport.authenticate("local", {})(req, res, function (err, use, info) {
      return res.json({ success: true, data: req?.session?.passport?.user });
    });
  });

router
  .route("/forgot-password")
  .get(async (req, res) => {
    // renders page where user can set new pwd
    res.render("auth/forgotPassword", {
      title: "Forgot Password",
      layout: "main",
    });
  })
  .post(async (req, res) => {
    // post new pwd to DB
    // redirect to login

    try {
      userEmail = authHelpers.checkEmail(req.body.email);
      const userByEmail = await userDL.getUserByEmail(userEmail);
      sendForgotPasswordLinkEmail(
        { id: userByEmail._id, email: userByEmail.email, redirect: true },
        res
      );
    } catch (e) {
      return res.status(400).render("auth/forgotPassword", {
        layout: "main",
        title: "Forgot Password",
        error: e,
      });
    }
  });

router
  .route("/reset-password/:id")
  .get(async (req, res) => {
    return res.render("auth/resetPassword", {
      layout: "main",
      title: "Reset Password",
      id: req.params.id,
    });
  })
  .post(async (req, res) => {
    try {
      userPassword = authHelpers.checkPassword(req.body.newPassword);
      const userPasswordUpdate = await userDL.updatePassword(
        req.params.id,
        req.body.newPassword
      );
      res.redirect("/auth/login");
    } catch (e) {
      return res.status(400).render("auth/resetPassword", {
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
  .get(isUserVerified, async (req, res) => {
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
      return res.status(400).send(e);
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

            // update the session obj
            req.session.passport.user.isVerified = true;

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
    return res.status(400).send(e);
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
      next(err);
    }
    return res.json({ logout: true });
  });
});

async function takingInUser(req, res, next) {
  try {
    userEmail = authHelpers.checkEmail(req.body.email);
    userPassword = authHelpers.checkPassword(req.body.password);
    next();
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
}

module.exports = router;
