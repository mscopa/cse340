// Needed resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const classificationValidation = require("../utilities/classification-validation");
const invValidation = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailByInventoryId));

// Route to access managament view
router.get("/management", utilities.handleErrors(invController.buildManagementView));

// Route to build classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Router to add classification
router.post(
    "/add-classification", 
    classificationValidation.classificationRules(),
    classificationValidation.checkClassificationData,
    utilities.handleErrors(invController.addClassificationToDB));

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// Route to add inventory
router.post(
    "/add-inventory",
    invValidation.inventoryRules(),
    invValidation.checkInventoryData,
    utilities.handleErrors(invController.addInventory),
);

module.exports = router;