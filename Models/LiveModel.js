const mongoose = require("mongoose");

const liveSchema = new mongoose.Schema({
    location:{
        type: String,
    },

    date:{
        type: String,
        required:[true, "A live must have a date."]
    },

    performancer:{
        type: String,
        required:[true, "A live must have a performancer."]
    },
    
    ratingsAverage:{
        type: Number,
        default: 4.0,
        min:[0.0, "Rating must be above 0.0"],
        max:[5.0, "Rating must be below 5.0"],
        set: val => Math.round(val * 10) / 10
    },

    ratingsQuantity:{
        type: Number,
        default: 0
    },

    imageCover:{
        type: String,
        default: "default.jpg"
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

liveSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "live",
    localField: "_id",
});

liveSchema.index({ratingsAverage: -1});
liveSchema.index({performancer: 1, date: 1}, {unique: true});
const Live = mongoose.model("Live", liveSchema);
module.exports = Live;