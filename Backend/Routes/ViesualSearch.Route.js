const express = require("express");
const { VisualSearch } = require("../Controllers/VisualSearch.Controller");
const visualSearchRouter = express.Router();
const memoryUpload = require("../Middlewares/uploadMemory"); // ← use this instead

visualSearchRouter.post("/search", memoryUpload.any(), VisualSearch);

module.exports = visualSearchRouter;