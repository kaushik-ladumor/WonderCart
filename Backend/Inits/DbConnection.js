const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL
const DbConnection = async() =>{
    mongoose.connect(DB_URL)
    .then((result) => {
        console.log("Database connection successfully");
    }).catch((err) => {
        console.log("Database connection failed", err);
    });
}

module.exports = DbConnection;