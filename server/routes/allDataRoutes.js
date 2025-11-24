const express = require('express');
const router = express.Router();
const All = require('../controllers/allDataController')

router.get('/getData', All.GetUsers);
router.post('/addContacts',All.UpdateContacts)

module.exports = router 