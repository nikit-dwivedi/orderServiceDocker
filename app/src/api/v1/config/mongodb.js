const mongoose = require("mongoose");
require('dotenv').config()

const username = process.env.DBUSERNAME
const password = process.env.DBPASSWORD
const datebase = process.env.DBNAME
db = mongoose.connect(
  `mongodb+srv://${username}:${password}@atlascluster.4o8is3b.mongodb.net/${datebase}?retryWrites=true&w=majority`,
  (err) => {
    console.log("Database connected");
    if (err) {
      console.log(err);
    }
  }
);
module.exports = { db };
