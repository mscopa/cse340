// Needed resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");
const accountsController = require("../controllers/accountController");

// Route to build account view
router.get("/login", utilities.handleErrors(accountsController.buildLogin));
router.get("/registration", utilities.handleErrors(accountsController.buildRegistration));
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData, 
    utilities.handleErrors(accountsController.registerAccount),
);

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountsController.accountLogin),
);

// Route to account managament view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountsController.buildAccountManagement));

// Route to update account view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountsController.buildUpdateAccount));

// Route to process account update
router.post(
    "/update/:account_id",
    utilities.checkLogin,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountsController.updateAccount),
);

// Route to process password update
router.post(
    "/update-password/:account_id",
    utilities.checkLogin,
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountsController.updatePassword),
);

// Route to logout
router.get("/logout", (req, res) => {
    res.clearCookie("jwt")
    res.redirect("/")
});

module.exports = router;
