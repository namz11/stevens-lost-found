const express = require("express");
const router = express.Router();
const path = require("path"); // can you for static files if needed
const {
    UserOTPVerification,
} = require("../data/models/userOTPVerification.model");
const { userVerificationDL, userDL } = require("../data");
const { sendOTPVerificationEmail } = require("../utils/mailer");
const data = require("../data");
const dataFunctions = data.userDL;
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStorage = require("node-localstorage").LocalStorage;
var localStorage = new LocalStorage("./scratch");
const initializePassport = require("../utils/passport");
const { usersCollection } = require("../config/mongoCollections");

//
//
initializePassport(passport, (email) =>
    users.find((user) => user.email === email)
);
//
//

router.route("/").get(checkAuthenticated, async(req, res) => {
    try {
        const user = localStorage.getItem("user");
        res.sendFile(path.join(__dirname, "../static/index.html"));
    } catch {
        console.log("Error");
    }
});

// router
//     .route("/register")
//     .get(async(req, res) => {
//         // renders register page
//     })
//     .post(async(req, res) => {
//         // create user
//     });

// router
//     .route("/login")
//     .get(async(req, res) => {
//         // renders login page
//     })
//     .post(async(req, res) => {
//         // login user
//         // after successful login go to listings
//     });

router
    .route("/register")
    .get(checkNotAuthenticated, async(req, res) => {
        // renders register page
        res.render("templates/register", { title: "Register" });
    })
    .post(checkNotAuthenticated, async(req, res) => {
        // create user
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const result = await dataFunctions.enterUser(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.phoneNumber,
                hashedPassword
            );

            console.log(result);
            res.redirect("/auth/login");
        } catch {
            res.redirect("/auth/register");
        }
    });

router
    .route("/login")
    .get(checkNotAuthenticated, async(req, res) => {
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
    .get(checkNotAuthenticated, async(req, res) => {
        // renders page where user can set new pwd
        res.render("templates/forgotPwd", { title: "Forgot Password" });
    })
    .post(checkNotAuthenticated, async(req, res) => {
        // post new pwd to DB
        // redirect to login
    });

router
    .route("/verify")
    .get(async(req, res) => {})
    .post(async(req, res) => {
        // verify user
        // redirect to listings
    });

router.route("/verify-user").get(async(req, res) => {});

router.route("/verify-user").post(async(req, res) => {
    try {
        const { userId, otp } = req.body;
        // TODO validations
        const verifications = await userVerificationDL.getUserVerificationByUserId(
            userId
        );
        if (verifications.length > 0) {
            const verification = verifications[0];
            if (verification.expiresAt < Date.now()) {
                await userVerificationDL.deleteMany(userId);
                throw "Code has expired. Try again";
                // TODO send error to user
            } else {
                if (otp === verification.otp) {
                    const userObj = await userDL.verifyUser(userId);
                    // TODO store userObj in localstorage
                    await userVerificationDL.deleteMany(userId); // delete verification data after success
                    // TODO send success to user
                } else {
                    throw "Invalid code. Check your inbox";
                    // TODO send error to user
                }
            }
        }
    } catch (error) {
        // TODO send error to user
    }
});

router.route("/logout").delete(async(req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect("/auth/login");
        localStorage.clear();
    });
});

router.route("/resend-otp").post(async(req, res) => {
    try {
        const { userId, email } = req.body;
        // TODO validations
        await userVerificationDL.deleteMany(userId);
        sendOTPVerificationEmail({ userId, email }, res);
    } catch (error) {
        // TODO send error to user
    }
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