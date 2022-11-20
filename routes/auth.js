const express = require('express');
const router = express.Router();
const path = require('path'); // can you for static files if needed
const {
	UserOTPVerification,
} = require('../data/models/userOTPVerification.model');
const { userVerificationDL, userDL } = require('../data');
const { sendOTPVerificationEmail } = require('../utils/mailer');

router
	.route('/register')
	.get(async (req, res) => {
		// renders register page
	})
	.post(async (req, res) => {
		// create user
	});

router
	.route('/login')
	.get(async (req, res) => {
		// renders login page
	})
	.post(async (req, res) => {
		// login user
		// after successful login go to listings
	});

router
	.route('/forgot-password')
	.get(async (req, res) => {
		// renders page where user can set new pwd
	})
	.post(async (req, res) => {
		// post new pwd to DB
		// redirect to login
	});

router
	.route('/verify')
	.get(async (req, res) => {
		// renders page where user can enter otp
	})
	.post(async (req, res) => {
		// verify user
		// redirect to listings
	});

router.route('/verify-user').post(async (req, res) => {
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
				throw 'Code has expired. Try again';
				// TODO send error to user
			} else {
				if (otp === verification.otp) {
					const userObj = await userDL.verifyUser(userId);
					// TODO store userObj in localstorage
					await userVerificationDL.deleteMany(userId); // delete verification data after success
					// TODO send success to user
				} else {
					throw 'Invalid code. Check your inbox';
					// TODO send error to user
				}
			}
		}
	} catch (error) {
		// TODO send error to user
	}
});

router.route('/resend-otp').post(async (req, res) => {
	try {
		const { userId, email } = req.body;
		// TODO validations
		await userVerificationDL.deleteMany(userId);
		sendOTPVerificationEmail({ userId, email }, res);
	} catch (error) {
		// TODO send error to user
	}
});

module.exports = router;
