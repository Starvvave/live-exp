const Live = require("../Models/LiveModel");
const operations = require("./CRUDOperations");

exports.getAllLives = operations.getAll(Live);
exports.getLive = operations.getOne(Live, { path: 'reviews' });
exports.createLive = operations.createOne(Live);
exports.updateLive = operations.updateOne(Live);
exports.deleteLive = operations.deleteOne(Live);