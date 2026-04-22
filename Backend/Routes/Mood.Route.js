const express = require("express");
const moodRouter = express.Router();
const MoodController = require("../Controllers/Mood.Controller");
const Authorization = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");

// ✅ PUBLIC ROUTES
moodRouter.get("/", MoodController.getActiveMoods);
moodRouter.get("/products/:moodName", Authorization, MoodController.getProductsByMood);

// ✅ USER ROUTES
moodRouter.get("/history", Authorization, MoodController.getUserMoodHistory);

// ✅ ADMIN ROUTES
moodRouter.get("/all", Authorization, authorizeRoles("admin"), MoodController.getAllMoodsAdmin);
moodRouter.post("/", Authorization, authorizeRoles("admin"), MoodController.createMood);
moodRouter.put("/:id", Authorization, authorizeRoles("admin"), MoodController.updateMood);
moodRouter.patch("/:id/toggle", Authorization, authorizeRoles("admin"), MoodController.toggleMoodStatus);
moodRouter.delete("/:id", Authorization, authorizeRoles("admin"), MoodController.deleteMood);
moodRouter.get("/analytics", Authorization, authorizeRoles("admin"), MoodController.getMoodAnalytics);

module.exports = moodRouter;
