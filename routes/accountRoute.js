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
    (req, res) => {
        res.status(200).send('login process');
    }
);

module.exports = router;
