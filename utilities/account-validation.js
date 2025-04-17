const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

/* ************************
 * Registration Data Validation Rules
 * ************************/
validate.registrationRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.
        // lastname is required and must be a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.
        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different mail.");
                }
            }),
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ************************
 * Check data and return errors or continue to registration
 * ************************/
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/registration", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    };
    next();
};

/* ************************
 * Login Data Validation Rules
 * ************************/
validate.loginRules = () => {
    return [
        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required."),
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Please provide a password."),
    ];
};

/* ************************
 * Check data and return errors or continue to login
 * ************************/
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        });
        return;
    };
    next();
};

/* ************************
 * Update Account Data Validation Rules
 * ************************/
validate.updateAccountRules = () => {
    return [
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a first name."),
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please provide a last name."),
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
          const existing = await accountModel.checkExistingEmail(account_email);
          const currentEmail = req.session.account.account_email;
          if (existing && account_email !== currentEmail) {
            throw new Error("Email already in use.");
          }
        }),
    ];
};

/* ************************
 * Check data and return errors or continue to update account
 * ************************/
validate.checkUpdateData = async (req, res, next) => {
const errors = validationResult(req);
const { account_id, account_firstname, account_lastname, account_email } = req.body;
if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
    errors,
    title: "Update Account",
    nav,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
    });
    return;
}
next();
};

/* ************************
 * Update Password Data Validation Rules
 * ************************/
validate.updatePasswordRules = () => {
    return [
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, number, and symbol."),
    ];
};

/* ************************
 * Check data and return errors or continue to update password
 * ************************/
validate.checkUpdatePasswordData = async (req, res, next) => {
    const errors = validationResult(req);
    const { account_id } = req.body;
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/update", {
        errors,
        title: "Update Account",
        nav,
        account_id,
      });
      return;
    }
    next();
};


module.exports = validate;