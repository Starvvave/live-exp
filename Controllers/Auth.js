const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require('../Models/UserModel');
const { promisify } = require("util");

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie("jwt", token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https"
    });

    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {user}
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    
    if (!email || !password) {
        return next(new AppError("Please provide Email and password", 400));
    }

    const user = await User.findOne({email}).select("+password");
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect Email or password", 401));
    }

    createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: "success"
    });
};

exports.protect = catchAsync(async(req, res, next) => {
    let token;
    if (req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("Please log in to get access.", 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this token no longer exist.", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("The user recently changed password. Please log in again.", 401));
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = async(req, res, next) => {
    if (req.cookies.jwt) {
        try{
            const decode = await promisify(jwt.verify)
            (req.cookies.jwt, process.env.JWT_SECRET);

            const currentUser = await User.findById(decode.id);
            if (!currentUser) return next();

            if (currentUser.changedPasswordAfter(decode.iat)) return next();

            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action.", 403));
        }
        next();
    };
};

exports.forgetPassword = catchAsync(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return next(new AppError("There is no user with this Email address.", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    try{
        const resetURL = `${req.protocol}://${req.get("host")}
        /api/user/resetPassword/${resetToken}}`;
        await new Email(user, resetURL).send();

        res.status(200).json({
            status: "success",
            message: "Token sent to Email."
        });
    } catch (error) {
        user.PasswordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError(
            "There is something wrong with sending the Email. Please try again later"), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest('hex');
    const user = await User.findOne({
        PasswordResetToken: hashedToken,
        PasswordResetExpires: {$gt: Date.now()}
    })

    if (!user) {
        return next(new AppError("Token has expired or invalid.", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne(req.user.id).select("+password");

    if (!await user.correctPassword(req.body.password, user.password)) {
        return next(new AppError("Current Password is not right.", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
})