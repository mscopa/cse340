// Needed resources
const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities/");

// Route to handle errors
router.get("/trigger-error", utilities.handleErrors(errorController.triggerError));

module.exports = router;