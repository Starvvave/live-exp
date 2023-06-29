const AppError = require("../utils/AppError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateErrorDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate value for: ${value}. Please use another value.`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => 
    new AppError("Invalid token. Please log in agian.", 401);

const handleJWTExpieredError = () =>
    new AppError("Your token has expired. Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startswith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startswith("/api")){
        if (err.operational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        return res.status(500).json({
            status: "error",
            message:"Something went wrong."
        });
    }

    if (err.operational) {
        return res.status(err.statusCode).render('error', {
          title: 'Something went wrong!',
          msg: err.message
        });
      }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });  
};

module.exports = (err, req, res) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateErrorDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpieredError();

        sendErrorProd(error, req, res);
    }
};