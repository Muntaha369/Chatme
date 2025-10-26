const express = require('express');
const router = express.Router();
const All = require('../controllers/allDataController')

router.get('/getData', All.GetUsers);

module.exports = router 