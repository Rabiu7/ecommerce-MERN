const express = require("express");

const router = express.Router();

const { getAddress, saveAddress } = require("../controllers/addressController");

router.get("/:userId", getAddress);

router.post("/:userId", saveAddress);

module.exports = router;
