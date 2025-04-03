const errorController = {};

 /* ***********************
 * Error Handling Middleware
 *************************/
errorController.triggerError = (req, res, next) => {
    try {
        throw new Error("Intentional 500 error triggered!");
    } catch (error) {
        next(error);
    }
};

module.exports = errorController;