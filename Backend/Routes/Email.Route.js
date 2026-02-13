const express = require("express");
const router = express.Router();
const { generateEmailContent } = require("../Controllers/Email.Controller");

router.post("/generate", generateEmailContent);

module.exports = router;
