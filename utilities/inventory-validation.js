const { body, validationResult } = require("express-validator");
const validate = {};

validate.inventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .notEmpty()
        .withMessage("Please provide the make of the vehicle."),
      body("inv_model")
        .trim()
        .notEmpty()
        .withMessage("Please provide the model of the vehicle."),
      body("inv_year")
        .trim()
        .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
        .withMessage("Please provide a valid year."),
      body("inv_description")
        .trim()
        .notEmpty()
        .withMessage("Please provide a description."),
      body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Please provide a valid image path."),
      body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Please provide a valid thumbnail path."),
      body("inv_price")
        .trim()
        .isFloat({ min: 0 })
        .withMessage("Please provide a valid price."),
      body("inv_miles")
        .trim()
        .isInt({ min: 0 })
        .withMessage("Please provide a valid mileage."),
      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Please provide a color."),
      body("classification_id")
        .notEmpty()
        .isInt()
        .withMessage("Please choose a classification."),
    ];
};

// Validation for adding inventory
validate.checkInventoryData = async (req, res, next) => {
    const {
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
      inv_price, inv_miles, inv_color, classification_id
    } = req.body;
  
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const utilities = require(".");
      const invModel = require("../models/inventory-model");
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const nav = await utilities.getNav();
  
      res.render("inventory/add-inventory", {
        errors,
        title: "Add Vehicle",
        nav,
        classificationSelect,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
      return;
    }
  
    next();
};

// check inventory data for edit inventory
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color, classification_id
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const utilities = require(".");
    const itemName = inv_make + " " + inv_model;
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    const nav = await utilities.getNav();

    res.render("inventory/edit", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }

  next();
};

// Validation rules for delete
validate.deleteInventoryRules = () => {
  return [
    body("inv_id")
      .notEmpty()
      .isInt()
      .withMessage("Vehicle ID is invalid or missing."),
  ];
};

validate.checkDeleteData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const utilities = require(".");
    const nav = await utilities.getNav();

    res.render("inventory/delete-confirm", {
      errors,
      title: "Delete " + inv_make + " " + inv_model,
      nav,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
    return;
  }

  next();
};

module.exports = validate;

