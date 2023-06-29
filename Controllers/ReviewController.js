const Review = require("../Models/ReviewModel");
const Live = require("../Models/LiveModel");
const catchAsync = require("../utils/catchAsync");
const operations = require("./CRUDOperations");

exports.findLiveUserId = catchAsync(async(req, res, next) => {
    if (!req.body.user) {req.body.user = req.user.id;}
    const live = await Live.findOne({performancer: req.body.performancer,
        date: req.body.date});
    if (!live) { 
    const createdLive = await (operations.findCreate(req, res, next));
    req.body.id = createdLive.id;
   } 

    next();
});

exports.setLiveUserId = catchAsync(async(req, res, next) => {
    if (!req.body.user) {req.body.user = req.user.id;}
    const live = await Live.findOne({performancer: req.body.performancer,
        date: req.body.date});
    req.body.live = live.id;
    req.body.id = live.id;
    await operations.findUpdate(req, res, next);
    
    next();
});

exports.getAllReviews = operations.getAll(Review);
exports.getReview = operations.getOne(Review);
exports.createReview = operations.createOne(Review);
exports.deleteReview = operations.deleteByUser(Review);