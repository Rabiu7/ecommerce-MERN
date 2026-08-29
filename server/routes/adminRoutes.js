const express = require("express");

const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");

router.get("/statistics", getDashboardStats);

module.exports = router;
