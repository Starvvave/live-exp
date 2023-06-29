const Live = require("../Models/LiveModel");
const User = require("../Models/UserModel");
const Review = require("../Models/ReviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    next();
  };

exports.getOverview = catchAsync(async(req, res, next) => {
    const lives = await Live.find();

    res.status(200).render("overview", {
        title: "All Lives",
        lives
    });
});

exports.share = (req, res) => {
    res.status(200).render("share", {
        title: "Share your live experience"
    });
};

exports.getLive = catchAsync(async(req, res, next) => {
    const live = await Live.findById(req.params.liveId).populate({
        path: "reviews",
        fields: "review rating user"
    });

    if (!live) return next(new AppError("There is no live with this id.", 404));

    res.status(200).render("live", {
        title: `${live.performancer} 's live`,
        live
    });
});

exports.getSignupForm = (req, res) => {
    res.status(200).render("signup", {
        title: "Sign up a new account"
    });
};

exports.getLoginForm = (req, res) => {
    res.status(200).render("login", {
        title: "Log in to your account"
    });
};

exports.getAccout = (req, res) => {
    res.status(200).render("account", {
        title: "Your account"
    });
};

exports.getMyReviews = catchAsync(async(req, res, next) => {
    const review = await Review.find({user: req.user.id}).populate({
        path: "user",
        fields: "name"
    }).populate({
        path: "live",
        fields: "performancer location"
    });

    const user = await User.findById(req.user.id).populate({
        path: "reviews",
        fields: "review rating live",
        populate: {
        path: "live",
        fields: "performancer location",
        },
    });

    res.status(200).render("myreview", {
        title: "My Reviews",
        review
    });
});

exports.updateUser = catchAsync(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true,
        validator: true
    });

    res.status(200).render("account", {
        title: "Your account",
        user
    });
});