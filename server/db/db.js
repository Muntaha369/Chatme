const mongoose = require('mongoose');

const ConnectDb = async()=>{
  try {
    await mongoose.connect(process.env.URI)
    console.log("connection succesfull to db");
  } catch (error) {
    console.error("connection fail to db");
    process.exit(0)
  }
}

module.exports = ConnectDb