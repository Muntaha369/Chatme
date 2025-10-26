const express = require('express');
const router = express.Router();
const Auth = require('../controllers/auth')

router.post('/register', Auth.register);
router.post('/login', Auth.login);
router.post('/verify', Auth.verify)

module.exports = router 