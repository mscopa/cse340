const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

 /* ***********************
 * Constructs the nav HTML unordered list
 *************************/
Util.getNav = async function () {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
        list += "<li>";
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            ' " title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>";
        list += "</li>";
    })
    list += "</ul>";
    return list;
};

 /* ***********************
    * Build the classification view HTML
    *************************/
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">';
        data.forEach(vehicle => {
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr/>';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
};

/* ***********************
 * Build the inventory detail view HTML
 *************************/
Util.buildVehicleDetail = async function (vehicle) {
    if (!vehicle) {
        return '<p class="notice">Vehicle details not found.</p>';
    }

    let detail = `
        <section class="vehicle-detail">
            <div class="vehicle-image">
                <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
            </div>
            <div class="vehicle-info">
                <h2>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h2>
                <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
                <p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
                <p><strong>Color:</strong> ${vehicle.inv_color}</p>
                <p class="description">${vehicle.inv_description}</p>
            </div>
        </section>
    `;

    return detail;
};

/* ***********************
 * Build classification List
 *************************/
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* ***********************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 *************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ************************
 * Middleware to check token validity
 *************************/
Util.checkJWTToken = (req, res, next) => {
    // allow access to home view
    res.locals.loggedin = 0
    res.locals.accountData = null

    if (req.cookies.jwt) {
     jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
       if (err) {
        req.flash("Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
       }
       res.locals.accountData = accountData
       res.locals.loggedin = 1
       next()
      })
    } else {
     next()
    }
};

/************************
 * Check login
 *************************/
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
      next()
    } else {
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    };
};

/*************************
 * Check if user is client, employee or admin
 *************************/
Util.checkAccountType = (req, res, next) => {
    const accountData = res.locals.accountData
  
    if (res.locals.loggedin && accountData) {
      const type = accountData.account_type
      if (type === "Employee" || type === "Admin") {
        return next()
      }
    }
    // If not logged in or not an employee/admin, redirect to login page
    req.flash("notice", "You must be logged in with proper permissions.")
    return res.redirect("/account/login")
  }

module.exports = Util;