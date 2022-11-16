const express = require('express');
const router = express.Router();
const path = require('path'); // can you for static files if needed

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

module.exports = router;
