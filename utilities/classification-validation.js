const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};

/* ************************
 * Classification Data Validation Rules
 * ************************/

validate.classificationRules = () => {
    return [
        // classification name is required and must be a string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .matches(/^[a-zA-Z0-9 ]+$/)
            .withMessage("Please provide a classification name."),
    ];
};

/* ************************
 * Check classification data and return errors or continue
 * ************************/
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: errors,
            classification_name,
        });
        return
    };
    next();
};

module.exports = validate;