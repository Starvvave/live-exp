const express = require("express");
const reviewController = require("../Controllers/ReviewController");
const authController = require("../Controllers/Auth");
const viewsController = require("../Controllers/ViewsController");
const imageController = require("../utils/Images");

const router = express.Router();

router.use(authController.protect);

router.route("/")
.get(reviewController.getAllReviews)
.post(authController.restrictTo("user"), ((req, res, next) => {console.log(req.body); next();}),
reviewController.findLiveUserId,
reviewController.setLiveUserId, reviewController.createReview); 

router.route("/:id")
.get(reviewController.getReview)
.delete(reviewController.deleteReview);

module.exports = router;