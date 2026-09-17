const express = require("express");

const router = express.Router();

const {
  addReminder,
  getUserReminders,
  deleteReminder,
  checkReminder,
} = require("../controllers/stockReminderController");

// Add reminder
router.post("/", addReminder);

// Get user's reminders
router.get("/:userId", getUserReminders);

router.get("/:userId/:productId", checkReminder);

// Delete reminder
router.delete("/:userId/:productId", deleteReminder);

module.exports = router;
