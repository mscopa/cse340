const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

/* ***********************
 * Deliver login view
 *************************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
};

/* ***********************
 * Deliver register view
 *************************/
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null,
    });
};

/* ***********************
 * Process registration
 *************************/
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        // Regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hash(account_password, 10); 
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration.");
        res.status(500).render("account/registration", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    );

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}! Please log in.`
        );
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        });
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.status(501).render("account/registration", {
            title: "Registration",
            nav,
        });
    };
}

/* ***********************
 * Process login request
 *************************/
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        req.session.account = accountData;
        if(process.env.NODE_ENV === 'development') {
          res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        return res.redirect("/account/")
      }
      else {
        req.flash("message notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        })
      }
    } catch (error) {
      throw new Error('Access Forbidden')
    }
};

/* ***********************
 * Deliver account management view
 *************************/
async function buildAccountManagement(req, res, next) {
  const { account_firstname, account_type, account_id } = req.session.account
    let nav = await utilities.getNav();
    res.render("account/account-management", {
        title: "Account Management",
        nav,
        account_firstname,
        account_type,
        account_id,
    });
};

/* ***********************
 * Deliver update account view
 *************************/
async function buildUpdateAccount(req, res, next) {
    const { account_id } = req.params;
    const accountData = await accountModel.getAccountById(account_id);
    let nav = await utilities.getNav();
    res.render("account/update", {
        title: "Update Account",
        nav,
        account_id,
        accountData,
        errors: null,
    });
};

/* ***********************
 * Process account update
 *************************/
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id } = req.params;
    const { account_firstname, account_lastname, account_email } = req.body;
    const updatedAccount = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    );
    if (updatedAccount) {
        req.flash("notice", "Your account has been updated.");
        res.redirect("/account/");
    } else {
        req.flash("notice", "Sorry, the update failed.");
        res.status(501).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
        });
    };
};

/* ***********************
 * Process password update
 *************************/
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed.");
      res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    req.flash("notice", "An error occurred.");
    res.redirect("/account/update/" + account_id);
  }
};

module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword };