const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require('express-mongo-sanitize');

const ErrorHandler = require("./Controllers/ErrorHandler");
const AppError = require("./utils/AppError");
const ViewRouter = require("./Routes/ViewRoutes");
const LiveRoutes = require("./Routes/LiveRoutes");
const ReviewRoutes = require("./Routes/ReviewRoutes");
const UserRoutes = require("./Routes/UserRoutes");

//start app //
const app = express();

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

app.enable("trust proxy");

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// global middlewares //
// 1. implement Cors //
app.use(cors());
app.options("*", cors());

//2. implement security http headers //
app.use(helmet());

//3. implement rate limit //
const limit = rateLimit({
    max: 50,
    windowMS: 60 * 60 * 1000,
    message: "Too many requests in an hour. Please try again later."
});
app.use("/api", limit);

//4. reading data from body & cookie//
app.use(express.json({limit: "100kb"}));
app.use(cookieParser());

//5. protect against noSql query injection//
app.use(mongoSanitize());

app.use(express.static(`${__dirname}/public`));

//Routers //
app.use("/", ViewRouter);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/lives", LiveRoutes);
app.use("/api/users", UserRoutes);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(ErrorHandler);
module.exports = app;