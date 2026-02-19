const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');

// public
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);



// view user results
router.get('/api/results/:userId', userCtrl.getUserResults);
router.post("/auth/forgot-password", authCtrl.forgotPassword);
router.post("/auth/verify-otp", authCtrl.verifyOtp);
router.post("/auth/reset-password", authCtrl.resetPassword);

module.exports = router;
