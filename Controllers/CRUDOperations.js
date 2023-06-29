const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const Live = require("../Models/LiveModel");

exports.findCreate = 
async(req, res, next) => {
    const doc = await Live.create(req.body);  
    return doc;
};

exports.createOne = Model => 
catchAsync(async(req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data:{
            data: doc
        }
    });
});

exports.getOne = (Model, options) => 
catchAsync(async(req, res, next) => {
    let query = Model.findById(req.body.id);
    if (options) {query = query.populate(options);}
    const doc = await query;

    if (!doc) {return next(new AppError("No document found.", 404));}

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => 
catchAsync(async(req, res, next) => {
    let filter = {};
    if (req.params.liveId) {filter = {live: req.params.liveId};}

    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

    const doc = await features.query;
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    });
});

exports.updateOne = Model =>
catchAsync(async(req, res, next) => {
    if (!req.body.id) req.body.id = req.params.liveId;
    const doc = await Model.findByIdAndUpdate(req.body.id, 
        req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError("No files found with that Id", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    });
});

exports.findUpdate =  
async(req, res, next) => {
    if (!req.body.id) req.body.id = req.params.liveId;

    const doc = await Live.findByIdAndUpdate(req.body.id, 
        req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError("No files found with that Id", 404));
    }
};

exports.deleteOne = Model =>
catchAsync(async(req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("No files found with that Id", 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.deleteByUser = Model => 
catchAsync(async(req, res, next) => {
    const doc = await Model.findOneAndDelete({user: req.user.id, _id: req.params.id});

    if (!doc) {
        return next(new AppError("No files found with that Id", 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});