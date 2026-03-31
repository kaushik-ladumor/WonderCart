const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL
const DbConnection = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Database connection successful");
  } catch (err) {
    console.log("Database connection failed", err);
    process.exit(1);
  }
};

module.exports = DbConnection;