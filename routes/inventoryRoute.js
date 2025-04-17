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
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView));

// Route to build classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Router to add classification
router.post(
    "/add-classification",
    utilities.checkAccountType,
    classificationValidation.classificationRules(),
    classificationValidation.checkClassificationData,
    utilities.handleErrors(invController.addClassificationToDB));

// Route to build add inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Route to add inventory
router.post(
    "/add-inventory",
    utilities.checkAccountType,
    invValidation.inventoryRules(),
    invValidation.checkInventoryData,
    utilities.handleErrors(invController.addInventory),
);

// setup route to build edit inventory view ANAX
router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Route to modify inventory view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Route to update inventory
router.post(
    "/edit/:inv_id",
    utilities.checkAccountType,
    invValidation.inventoryRules(),
    invValidation.checkUpdateData,
    utilities.handleErrors(invController.updateInventory),
);

// Route to delete inventory view
router.get("/delete-confirm/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Route to delete inventory item
router.post(
    "/delete-confirm/:inv_id",
    utilities.checkAccountType,
    invValidation.deleteInventoryRules(),
    invValidation.checkDeleteData,
    utilities.handleErrors(invController.deleteInventory),
)

module.exports = router;