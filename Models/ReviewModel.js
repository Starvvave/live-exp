const mongoose = require("mongoose");
const Live = require("./LiveModel");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review can't be empty."]
    },
    rating: {
        type: Number,
        min: [0.0, "Rating must be above 0.0"],
        max: [5.0, "Rating must be below 5.0"],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    live: {
        type: mongoose.Schema.ObjectId,
        ref: "Live",
        required: [true, "Review must belong to a live performance."]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user."]
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

reviewSchema.index({live: 1, user: 1}, {unique: true});
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: "user",
        select: "name photo"
    }).populate({
        path: "live",
        select: "performancer date location"
    });
    next();
});

reviewSchema.statics.calcAverRatings = async function(liveId) {
    const stats = await this.aggregate([
        {$match: {live: liveId}},
        {$group: {
            _id: "$live",
            nRating: { $sum: 1},
            averRating: { $avg: "$rating"}
        }}
    ]);

    if (stats.length > 0) {
        await Live.findByIdAndUpdate(liveId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].averRating
        });
    }
};

reviewSchema.post('save', function() {
    this.constructor.calcAverRatings(this.live);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverRatings(this.r.live);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;