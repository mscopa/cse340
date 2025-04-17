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
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        classificationList,
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
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
      return res.json(invData)
    } else {
      next(new Error("No data returned"))
    };
};

/* ******************************************
 * Edit inventory to DB
 *******************************************/
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = (await invModel.getInventoryByInventoryId(inv_id))[0];
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;
    const updateResult = await invModel.updateInventory(
      inv_id,  
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )
  
    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the insert failed.")
      res.status(501).render("inventory/edit", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
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
      classification_id
      })
    }
};

/* ******************************************
 * Delete inventory View
 *******************************************/
invCont.deleteInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav();
    const itemData = (await invModel.getInventoryByInventoryId(inv_id))[0];
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id);
  
    // Intentamos borrar el ítem con el modelo (todavía falta crearlo)
    const deleteResult = await invModel.deleteInventoryItem(inv_id);
  
    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      res.status(501).render("inventory/delete-confirm", {
        title: "Delete Inventory",
        nav,
        inv_id,
        errors: null
      });
    }
  };


module.exports = invCont;