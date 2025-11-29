const express = require('express');
const router = express.Router();
const All = require('../controllers/allDataController')

router.get('/getData', All.GetUsers);
router.post('/addContacts',All.UpdateContacts)
// router.post('/getMessage',All.GetMessage)
router.post('/addMessage', All.addMessage)
router.post('/newRoom',All.createRoom)

module.exports = router 