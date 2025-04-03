// Needed resources
const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");

// Route to handle errors
router.get("/trigger-error", errorController.triggerError);

module.exports = router;