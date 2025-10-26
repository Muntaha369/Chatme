const mongoose = require('mongoose');
const {URI} = require('../keys/keys')

const ConnectDb = async()=>{
  try { 
    await mongoose.connect(URI)
    console.log("connection succesfull to db");
  } catch (error) {
    console.error("connection fail to db");
    process.exit(0)
  }
}

module.exports = ConnectDb