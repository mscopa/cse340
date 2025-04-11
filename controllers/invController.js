const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

 /* ******************************************
    * Build inventory by classification view
 *******************************************/
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
};

/* ******************************************
    * Build vehicle detail view
 *******************************************/
invCont.buildDetailByInventoryId = async function (req, res, next) {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryByInventoryId(inv_id);
    const vehicle = await utilities.buildVehicleDetail(data[0]);
    console.log(data);
    let nav = await utilities.getNav();
    res.render("./inventory/detail", {
        title: data[0].inv_make + " " + data[0].inv_model + " details",
        nav,
        vehicle,
    });
};

/* ******************************************
    * Build management view
 *******************************************/
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
    });
};

/* ******************************************
    * Build add classification view
 *******************************************/
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
    });
};

/* ******************************************
 * Add classification to DB
 *******************************************/
invCont.addClassificationToDB = async function (req, res, next) {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;
    const addClassifResult = await invModel.addClassification(classification_name);
    if (addClassifResult) {
        nav = await utilities.getNav();
        req.flash("notice", `Classification ${classification_name} added to the database.`);
        res.status(201).render("./inventory/management", {
            title: "Inventory Management",
            nav,
        });
    } else {
        req.flash("notice", "Sorry, there was an error processing the classification.");
        res.status(501).render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
        });
    }
};

/* ******************************************
 * Build add inventory view
 *******************************************/
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationSelect,
        errors: null,
    });
};

/* ******************************************
 * Add inventory to DB
 *******************************************/
invCont.addInventory = async function (req, res, next) {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    const addInvResult = await invModel.addInventory(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    );

    if (addInvResult) {
        req.flash("notice", `Vehicle ${inv_make} ${inv_model} was successfully added.`);
        res.status(201).redirect("/inv/management");
    } else {
        const nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        req.flash("notice", "Sorry, there was an error processing the vehicle.");
        res.status(501).render("./inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationSelect,
            errors: null,
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
    }
}

module.exports = invCont;